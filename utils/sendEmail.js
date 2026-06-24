import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
      
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER || 'tucorreo@gmail.com',
                pass: process.env.EMAIL_PASS || 'tucontraseñadeaplicacion',
            },
        });

        // mensaje en la consola
        console.log(`\n========================================`);
        console.log(`INTENTO DE ENVÍO DE CORREO A: ${options.email}`);
        console.log(`Asunto: ${options.subject}`);
        console.log(`Mensaje: \n${options.message}`);
        console.log(`========================================\n`);

        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'tucorreo@gmail.com') {
            console.log(' Aviso: No se ha configurado EMAIL_USER en el .env, no se enviará un correo real.');
            return;
        }

        const mailOptions = {
            from: 'Petin App <no-reply@petin.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        await transporter.sendMail(mailOptions);
        console.log(` Correo SMTP real enviado con éxito a ${options.email}`);
    } catch (error) {
        console.error('Error SMTP enviando el correo:', error.message);
        console.log('AVISO: El correo falló, pero puedes usar el código OTP impreso arriba 👆');
    }
};

export default sendEmail;
