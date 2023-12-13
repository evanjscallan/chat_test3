'use client';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:4000';

const ChatMain: React.FC = () => {
	const [room, setRoom] = useState<string>('');
	const [displayLeaveRoom, setDisplayLeaveRoom] = useState<boolean>(false);
	const [socket, setSocket] = useState<any>(null);
	const [allMessages, setAllMessages] = useState<string[]>([]);
	const [currentMessage, setCurrentMessage] = useState('');
	const [isShared, setIsShared] = useState<boolean>(false);
	const [users, setUsers] = useState<string[]>([]);

	useEffect(() => {
		const newSocket = io(SOCKET_SERVER_URL);
		setSocket(newSocket);
		newSocket.on('chat-message', (message: string) => {
			setAllMessages((prevMessages) => [...prevMessages, message]);
		});

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const sendMessage = () => {
		if (currentMessage !== '') {
			const messageData = {
				room,
				message: currentMessage,
			};
			socket.emit('chat-message', messageData);
			setCurrentMessage('');
		}
	};

	const joinRoom = () => {
		setDisplayLeaveRoom(true);
		if (room !== '') {
			socket.emit('join-room', room);
		}
	};

	const leaveRoom = () => {
		setDisplayLeaveRoom(false);
		if (room) {
			socket.emit('leave-room', room);
		}
		setRoom('');
		setAllMessages([]);
	};

	return (
		<>
			<div>
				<div>
					{allMessages.map((message, index) => (
						<p key={index}>{message}</p>
					))}
				</div>

				<input
					title="current-message"
					type="text"
					value={currentMessage}
					onChange={(e) => setCurrentMessage(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
				/>
				<button onClick={sendMessage}>Send</button>

				<div>
					{displayLeaveRoom ? (
						<div>
							<button onClick={leaveRoom}>Leave Room</button>
						</div>
					) : (
						<div>
							<input
								title="room-input"
								type="text"
								value={room}
								onChange={(e) => setRoom(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
							/>
							<button onClick={joinRoom}>Join Room</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default ChatMain;
