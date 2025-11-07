const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
Deno.serve(async (req) => {
	try {
		const body = await req.json();
		const email = body.email;
		console.log('Beginning Send welcome email for ' + email);
		if (!email || typeof email !== 'string') {
			console.error('Missing email');
			return new Response(
				JSON.stringify({
					error: 'Missing or invalid email'
				}),
				{
					status: 400
				}
			);
		}
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${RESEND_API_KEY}`
			},
			body: JSON.stringify({
				from: 'welcome-noreply@fitpress.app',
				to: email,
				subject: '🎉 Welcome to FitPress! Your fitness journey starts here 💪',
				text: `Hey there! 👋

Thanks for subscribing to FitPress! You're officially part of a community passionate about fitness, health, and growth.

🏋️‍♂️ Expect weekly updates, tips, and inspiration delivered straight to your inbox.  

Get ready to crush your goals and have some fun along the way! 💥

- The FitPress Team 💙`
			})
		});
		if (!response.ok) {
			const errorText = await response.text();
			console.error('Resend API error:', errorText);
			return new Response(
				JSON.stringify({
					error: 'Failed to send email'
				}),
				{
					status: 500
				}
			);
		}
		console.log(`✅ Welcome email sent to ${email}`);
		return new Response(
			JSON.stringify({
				ok: true
			}),
			{
				status: 200
			}
		);
	} catch (err) {
		console.error('Edge function error:', err);
		return new Response(
			JSON.stringify({
				error: 'Internal server error'
			}),
			{
				status: 500
			}
		);
	}
});
