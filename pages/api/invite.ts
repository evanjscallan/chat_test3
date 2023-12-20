import type { NextApiRequest, NextApiResponse } from "next";

import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)


type Message = {
    to: string, // Change to your recipient
    from: string, // Change to your verified sender
    subject: string,
    text: string,
    html: string,
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, roomNumber } = req.body
        const message: Message = {
            to: email,
            from: 'evan.scallan@dialexa.com',
            subject: 'chat room invite',
            text: `You have been invited to my chat room! Click the link below to join: 
            <b> https://localhost:3000/${roomNumber} </b>`,
            html: `https://localhost:3000/${roomNumber}`
        }
        
        try {
            sgMail.send(message)
            console.log('email sent succesfully!')
        } catch {
            console.log('Error: Failed to send email.')
        } 
    } else {
        res.status(405).end()
    }
}

export default handler
