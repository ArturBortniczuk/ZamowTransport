import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { 
      transportType, 
      wzNumbers, 
      deliveryDate, 
      deliveryDetails, 
      preferredDeliveryTime = '', 
      partialDelivery = false, 
      estimatedWeight = 0, 
      estimatedDimensions = '', 
      specialRequirements = '' 
    } = req.body;
    
    console.log('Otrzymane dane:', { transportType, wzNumbers, deliveryDate, deliveryDetails });
    
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp-eltron.ogicom.pl",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        debug: true,
        logger: true,
        timeout: 60000 // Opcjonalny timeout
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'logistyka@grupaeltron.pl',
        subject: 'Nowe zamówienie transportu',
        html: `
          <h1>Szczegóły zamówienia transportu</h1>
          <p><strong>Rodzaj transportu:</strong> ${transportType}</p>
          <p><strong>Numery WZ:</strong> ${wzNumbers.join(', ')}</p>
          <p><strong>Data dostawy:</strong> ${deliveryDate}</p>
          <p><strong>Preferowany czas dostawy:</strong> ${preferredDeliveryTime}</p>
          <h2>Szczegóły dostawy:</h2>
          <p><strong>Adres:</strong> ${deliveryDetails.fullAddress}</p>
          <p><strong>Osoba kontaktowa:</strong> ${deliveryDetails.contactPerson}</p>
          <p><strong>Numer telefonu:</strong> ${deliveryDetails.phoneNumber}</p>
          <p><strong>Dostawa częściowa:</strong> ${partialDelivery ? 'Tak' : 'Nie'}</p>
          <p><strong>Szacunkowa waga:</strong> ${estimatedWeight} kg</p>
          <p><strong>Szacunkowe wymiary:</strong> ${estimatedDimensions}</p>
          <p><strong>Wymagania specjalne:</strong> ${specialRequirements}</p>
          ${deliveryDetails.additionalInfo ? `<p><strong>Dodatkowe informacje:</strong> ${deliveryDetails.additionalInfo}</p>` : ''}
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'E-mail wysłany pomyślnie' });
      
    } catch (error) {
      console.error('Błąd podczas wysyłania e-maila:', error.stack);
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
