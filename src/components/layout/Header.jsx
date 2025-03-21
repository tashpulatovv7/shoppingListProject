import useAuth from '@/hooks/useAuth';
import { useGroups, useJoinGroup, useMyGroups } from '@/hooks/useGroups';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Avatar, Button, Dropdown, Input, Menu, Popover } from 'antd';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheck, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Header() {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const { logout } = useAuth();
	const [password, setPassword] = useState('');
	const [group, setGroup] = useState('');
	const { groups, isLoadingGroups } = useGroups(group);
	const { mutate: joinGroup, isLoading, isError, error } = useJoinGroup();
	const { refetch, myGroups } = useMyGroups();
	const menuRef = useRef(null);
	const { darkMode } = useTheme();
	const navigate = useNavigate();
	const user = useStore(state => state.user);

	// Guruhga qo'shish
	const handleJoin = group => {
		if (!group._id) {
			toast.error('Group ID is missing!');
			return;
		}
		if (!password) {
			toast.warning('Please enter a password.');
			return;
		}
		joinGroup(
			{ groupId: group._id, password },
			{
				onSuccess: () => {
					toast.success('Successfully joined the group!');
					setPassword('');
					setGroup('');
					refetch();
				},
				onError: err => {
					toast.error(err.response?.data?.error || 'Failed to join the group.');
				},
			}
		);
	};

	// Guruhga qo'shish uchun popover(modal)
	const joinPopoverContent = group => (
		<div>
			<Input
				type='password'
				value={password}
				onChange={e => setPassword(e.target.value)}
				style={{
					width: '100%',
					padding: '8px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
				placeholder='Enter group password'
			/>
			<Button
				type='primary'
				style={{
					backgroundColor: 'green',
					color: 'white',
					width: '100%',
					marginTop: '10px',
				}}
				onClick={() => handleJoin(group)}
				disabled={isLoading}
			>
				{isLoading ? 'Joining...' : 'Join'}
			</Button>
			{isError && toast.error(error?.message || 'Failed to join')}
		</div>
	);

	// Guruhlarni qidirish uchun filter
	const filteredGroups = groups?.filter(g => !myGroups?.some(myGroup => myGroup._id === g._id));

	const getInitials = name => {
		if (!name) return '?';
		return name
			.split(' ')
			.map(word => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getAvatarColor = name => {
		if (!name) return '#64748b';
		const colors = [
			'#4f46e5', // indigo
			'#3b82f6', // blue
			'#10b981', // emerald
			'#f59e0b', // amber
			'#ef4444', // red
			'#8b5cf6', // violet
			'#ec4899', // pink
			'#14b8a6', // teal
		];
		const index =
			name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
		return colors[index];
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const userMenu = (
		<Menu>
			<Menu.Item key='logout' icon={<FaSignOutAlt />} onClick={handleLogout}>
				Logout
			</Menu.Item>
		</Menu>
	);

	return (
		<header className={`header ${darkMode ? 'dark' : ''}`}>
			<div className='container'>
				<div className='menu-input'>
					<label>
						<FaSearch
							className='search-icon'
							style={{ color: '#64748b' }}
						/>
						<input
							type='text'
							placeholder='Search...'
							className='input'
							value={group}
							onChange={e => setGroup(e.target.value)}
						/>
						{group.length > 0 && (
							<div className='search-results'>
								{groups.length > 0 && !isLoadingGroups && (
									<h3>Groups</h3>
								)}
								<ul>
									{isLoadingGroups ? (
										<p className='loading'>
											Loading groups...
										</p>
									) : filteredGroups.length > 0 ? (
										filteredGroups.map((group, index) => (
											<li key={group.id || index + 1}>
												<div className='user'>
													<div className='user-info'>
														<h4>
															{
																group.name
															}
														</h4>
														<span>
															{new Date(
																group.createdAt
															)
																.toISOString()
																.slice(
																	0,
																	19
																)
																.replace(
																	'T',
																	' '
																)}
														</span>
													</div>
													<p>
														Created By:{' '}
														<span>
															{
																group
																	.owner
																	.name
															}
														</span>
													</p>
												</div>
												<Popover
													content={() =>
														joinPopoverContent(
															group
														)
													}
													title='Group password'
													trigger='click'
												>
													<button className='join-btn'>
														<FaCheck /> Join
													</button>
												</Popover>
											</li>
										))
									) : (
										<p className='no-results'>
											No groups found
										</p>
									)}
								</ul>
							</div>
						)}
					</label>
				</div>
				<div className='flex'>
					<div className='relative' ref={menuRef}>
						<Dropdown
							overlay={userMenu}
							placement='bottomRight'
							trigger={['click']}
						>
							<div className='profile-dropdown'>
								<Avatar
									size={40}
									style={{
										backgroundColor: getAvatarColor(
											user?.name
										),
										color: '#ffffff',
										fontWeight: 600,
										fontSize: '16px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										border: '2px solid #ffffff',
										boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
									}}
								>
									{getInitials(user?.name)}
								</Avatar>
							</div>
						</Dropdown>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
