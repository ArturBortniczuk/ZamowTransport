import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { transportType, wzNumbers, deliveryDate, deliveryDetails } = req.body;
    console.log('Otrzymane dane:', { transportType, wzNumbers, deliveryDate, deliveryDetails });
    
    try {
      // Konfiguracja transportera e-mail
      console.log('Konfiguracja transportera e-mail');
      let transporter = nodemailer.createTransport({
        host: "smtp-eltron.ogicom.pl",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        debug: true, // Włącz debugowanie
        logger: true // Włącz logowanie
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
      
      res.status(200).json({ message: 'E-mail wysłany pomyślnie' });
    } catch (error) {
      console.error('Błąd podczas wysyłania e-maila:', error);
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas wysyłania e-maila', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
