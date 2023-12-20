import React, { useState } from 'react';
import handler from '../../../pages/api/invite';

interface UserInfo {
	roomNumber: string;
}

const InviteElement: React.FC<UserInfo> = ({ roomNumber }) => {
	const [email, setEmail] = useState<string>('');
	// const [roomNumber, setRoomNumber] = useState<string>('111');
	const inviteUsers = async (email: string) => {
		try {
			const response = await fetch('/api/invite', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, roomNumber }),
			});

			if (!response.ok) {
				console.error('Response Status:', response.status);
				console.error('Response Text:', await response.text());
				throw new Error('Failed to send invite');
			}
			const data = await response.json();
			console.log(data.message);
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		await inviteUsers(email);
	};

	return (
		<>
			<div>
				<input
					type="text"
					value={email}
					placeholder="Enter email..."
					onChange={(e) => setEmail(e.target.value)}
				/>
				<button onClick={(e) => handleSubmit(e)}>Invite User to Room</button>
			</div>
		</>
	);
};

export default InviteElement;
