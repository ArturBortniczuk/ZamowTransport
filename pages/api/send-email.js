import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const convertDate = (dateString) => {
  const [day, month, year] = dateString.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

async function saveToSupabase(data) {
  try {
    const formattedDate = convertDate(data.deliveryDate); // Conversion happens here
    const { error } = await supabase
      .from('transport_orders')
      .insert([
        {
          transport_type: data.transportType,
          wz_numbers: data.wzNumbers,
          delivery_date: formattedDate,
          full_address: data.deliveryDetails.fullAddress,
          contact_person: data.deliveryDetails.contactPerson,
          phone_number: data.deliveryDetails.phoneNumber,
          additional_info: data.deliveryDetails.additionalInfo || ''
        }
      ]);

    if (error) throw error;
    console.log('Dane zapisane do Supabase');
  } catch (error) {
    console.error('Błąd podczas zapisywania do Supabase:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { transportType, wzNumbers, deliveryDate, deliveryDetails } = req.body;
    console.log('Otrzymane dane:', { transportType, wzNumbers, deliveryDate, deliveryDetails });
    
    try {
      // Wysyłanie e-maila
      console.log('Konfiguracja transportera e-mail');
      let transporter = nodemailer.createTransport({
        host: "smtp-eltron.ogicom.pl",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      console.log('Przygotowanie opcji e-maila');
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'logistyka@grupaeltron.pl',
        subject: 'Nowe zamówienie transportu',
        html: `
          <h1>Szczegóły zamówienia transportu</h1>
          <p><strong>Rodzaj transportu:</strong> ${transportType}</p>
          <p><strong>Numery WZ:</strong> ${wzNumbers.join(', ')}</p>
          <p><strong>Data dostawy:</strong> ${deliveryDate}</p>
          <h2>Szczegóły dostawy:</h2>
          <p><strong>Adres:</strong> ${deliveryDetails.fullAddress}</p>
          <p><strong>Osoba kontaktowa:</strong> ${deliveryDetails.contactPerson}</p>
          <p><strong>Numer telefonu:</strong> ${deliveryDetails.phoneNumber}</p>
          ${deliveryDetails.additionalInfo ? `<p><strong>Dodatkowe informacje:</strong> ${deliveryDetails.additionalInfo}</p>` : ''}
        `
      };
      
      console.log('Próba wysłania e-maila');
      await transporter.sendMail(mailOptions);
      console.log('E-mail wysłany pomyślnie');
      
      // Zapisywanie do Supabase
      console.log('Próba zapisu do Supabase');
      await saveToSupabase({ transportType, wzNumbers, deliveryDate, deliveryDetails });
      
      res.status(200).json({ message: 'E-mail wysłany i dane zapisane pomyślnie' });
    } catch (error) {
      console.error('Błąd podczas przetwarzania żądania:', error);
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas przetwarzania żądania', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
