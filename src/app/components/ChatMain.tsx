'use client';
import React, { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import InviteElement from './InviteElement';

const SOCKET_SERVER_URL = 'http://localhost:4000';

interface Message {
	room: string;
	username: string;
	message: string;
}

const ChatMain = () => {
	const [room, setRoom] = useState<string>('');
	const [displayLeaveRoom, setDisplayLeaveRoom] = useState<boolean>(false);
	const [socket, setSocket] = useState<any>(null);
	const [allMessages, setAllMessages] = useState<Message[]>([]);
	const [currentMessage, setCurrentMessage] = useState<string>('');
	const [tempUsername, setTempUsername] = useState<string>('');
	const [username, setUsername] = useState<string>('');

	useEffect(() => {
		const newSocket: Socket = io(SOCKET_SERVER_URL);
		setSocket(newSocket);
		newSocket.on('chat-message', (message: Message) => {
			console.log('Message data structure:', message);
			setAllMessages((prevMessages: any) => [...prevMessages, message]);
			console.log(allMessages);
		});
		return () => {
			newSocket.off();
		};
	}, []);

	const sendMessage = (): void => {
		if (currentMessage !== '') {
			const messageData = {
				room: room,
				username: username,
				message: currentMessage,
			};
			socket.emit('chat-message', messageData);
			setCurrentMessage('');
		}
	};

	const setUsernameAndClear = (): void => {
		setUsername(tempUsername);
		setTempUsername('');
	};

	const joinRoom = (): void => {
		if (room !== '' && tempUsername !== '') {
			setUsernameAndClear();
			setDisplayLeaveRoom(true);
			socket.emit('join-room', room);
		}
	};

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTempUsername(event.target.value);
	};

	const leaveRoom = (): void => {
		setDisplayLeaveRoom(false);
		if (room) {
			socket.emit('leave-room', room);
		}
		setRoom('');
		setUsername('');
		setAllMessages([]);
	};

	return (
		<>
			<div className="test">
				<div className="chatBox">
					{displayLeaveRoom ? (
						<p className="chat-box-content-room-number">
							{' '}
							Room Number: {room}{' '}
						</p>
					) : (
						<>
							<h2>Enter Room Number Below To Join Chat</h2>
						</>
					)}
					{allMessages.map((msg, index: number) => {
						return (
							<p className="chat-box-content" key={index}>
								{msg.username}: {msg.message}
							</p>
						);
					})}
					{displayLeaveRoom ? (
						<div className="room-chat-bottom-UI">
							<div className="send-input-div">
								<input
									placeholder="Enter Message..."
									title="current-message"
									type="text"
									value={currentMessage}
									disabled={!username}
									onChange={(e) => setCurrentMessage(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
								/>
							</div>
							<div className="send-div">
								<img
									className="send-button"
									onClick={sendMessage}
									title="send"
									src="icons8-send-material-outlined-96.png"
								/>
							</div>
						</div>
					) : (
						<></>
					)}
				</div>
				<div>
					<div>
						{displayLeaveRoom ? (
							<div className="chat-buttons">
								<button className="rounded-sm" onClick={leaveRoom}>
									Leave Room
								</button>
							</div>
						) : (
							<div className="join-room">
								<input
									className="border-b-[3px] rounded-tl-sm rounded-tr-sm"
									type="text"
									value={tempUsername}
									onChange={handleUsernameChange}
									placeholder="Enter your username..."
								/>
								<input
									title="room-input"
									placeholder="Enter room number..."
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
				<InviteElement roomNumber={room} />
			</div>
		</>
	);
};

export default ChatMain;
