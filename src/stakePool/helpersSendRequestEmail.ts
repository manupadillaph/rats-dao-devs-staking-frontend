
import Mailgen, { Content } from 'mailgen';
import nodemailer from 'nodemailer';
import { toJson } from '../utils/utils';

// Configure mailgen by setting a theme and your product info

const mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        // Appears in header & footer of e-mails
        name: process.env.NEXT_PUBLIC_RATS_PORTAL_NAME!,
        link: process.env.NEXT_PUBLIC_REACT_SERVER_URL!,
        logo: process.env.NEXT_PUBLIC_DEFAULT_POOL_IMAGE,
        logoHeight: '80px'
    },
});

//----------------------------------------------------------------------

export async function sendRequestMail(from: string, to: string, subject: string, data: any) {

    const dataKeyAndValue = Object.entries(data);
    //join the key and value of the object in a string
    // const dataString = dataKeyAndValue.map(([key, value]) => `${key}: ${toJson(value)}`).join('<br></br>');
    const dataKeyAndValue_ = dataKeyAndValue.map(([key, value]) => ({"Field": key, "Value": value}));
    
    const dataUri = dataKeyAndValue.map(([key, value ]) => `${key}=${encodeURIComponent(value as string)}`).join('&');

    const email: Content = {
        body: {
            // name: "",
            greeting: process.env.NEXT_PUBLIC_RATS_PORTAL_NAME,
            intro: "There is a new Staking Pool request", //dataString, //JSON.stringify(data, null, "<br></br>s"),
            table: {
                data: dataKeyAndValue_,
                columns: {
                        // Optionally, customize the column widths
                        customWidth: {
                                Field: '20%'
                        },
                        // Optionally, change column text alignment
                        // customAlignment: {
                        //      price: 'right'
                        // }
                }
            },
            action: [
                {
                        instructions: 'Follow this link to initiate the creation of the Staking Pool',
                        button: {
                            color: '#e2a6a6',
                            text: "Create",
                            link: process.env.NEXT_PUBLIC_REACT_SERVER_URL! +"/create?" + dataUri ,
                        }
                },
                {
                        instructions: 'Any question?',
                        button: {
                            color: '#3e9bcc',
                            text: 'FAQs',
                            link: process.env.NEXT_PUBLIC_REACT_SERVER_URL! +"/faqs"
                        }        
                }
            ],
            // outro: 'Thank you',
        },
    };

    // Generate an HTML email with the provided contents
    const emailBody = await mailGenerator.generate(email);
    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = await mailGenerator.generatePlaintext(email);

    // console.log ("host: "+ process.env!.MAIL_HOST! as unknown as string)
    // console.log ("port: "+ process.env!.MAIL_PORT! as unknown as number)
    // console.log ("user: "+ process.env!.MAIL_USER! as unknown as string)
    // console.log ("pass: "+ process.env!.MAIL_PASS! as unknown as string)

    const transporter = nodemailer.createTransport({
        

        host: process.env!.MAIL_HOST!,
        port: parseInt((process.env.MAIL_PORT!)),
        // secure: true,
        // secure: true, // upgrade later with STARTTLS
        // tls: {
        //   rejectUnauthorized: false
        // },
        auth: {
            user: process.env.MAIL_USER!,
            pass: process.env.MAIL_PASS!,
        },

    });

    const mailOptions = {
        from,
        to,
        subject,
        html: emailBody,
        text: emailText,
    };
    // send mail with defined transport object
    //return await transporter.sendMail(mailOptions);
    return await transporter.sendMail(mailOptions);
}
