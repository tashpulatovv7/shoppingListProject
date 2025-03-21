import {
	useAddMember,
	useConfirmDeleteGroup,
	useConfirmLeaveGroup,
	useGroupItems,
	useMember,
	useMyGroups,
	useRemoveMember,
} from '@/hooks/useGroups';
import { useStore } from '@/hooks/useStore';
import { Button, Dropdown, Input, List, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
	FaEllipsisV,
	FaPlus,
	FaSignOutAlt,
	FaTimes,
	FaTrashAlt,
	FaUserMinus,
	FaUserPlus,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';

function GroupPage() {
	const { id } = useParams();
	const { myGroups, isLoadingMyGroups } = useMyGroups();
	const group = myGroups.find(g => String(g._id) === String(id));
	const [member, setMember] = useState('');
	const { members, isLoadingMember, isErrorMember } = useMember(member);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const user = useStore(state => state.user);
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const confirmLeaveGroup = useConfirmLeaveGroup();
	const confirmDeleteGroup = useConfirmDeleteGroup();
	const { mutate: addMemberMutate } = useAddMember();
	const { mutate: removeMemberMutate } = useRemoveMember();
	const { addItemMutation, removeItemMutation } = useGroupItems();
	const [newItem, setNewItem] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoadingTimeout(true);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	if (!group) {
		return (
			<div style={{ textAlign: 'center', marginTop: '20vh' }}>
				{loadingTimeout ? (
					<p style={{ color: 'red', fontSize: '18px', textAlign: 'center' }}>
						Ma'lumot yuklanmadi. Iltimos, qayta urinib ko'ring!
					</p>
				) : (
					<Spin size='large' />
				)}
			</div>
		);
	}

	if (isLoadingMyGroups) {
		return <Spin size='large' />;
	}

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setMember('');
	};

	const handleSelectMember = member => {
		if (user._id !== group.owner._id) {
			toast.error('Only the group owner can add new members!');
			return;
		}
		Modal.confirm({
			title: 'Confirm Member Addition',
			content: `Do you want to add ${member.name} (@${member.username}) to the group?`,
			onOk: () => {
				return new Promise((resolve, reject) => {
					addMemberMutate(
						{ groupId: group._id, memberId: member._id },
						{
							onSuccess: () => {
								setIsModalOpen(false);
								setMember('');
								toast.success(
									`${member.name} was added successfully!`
								);
								resolve();
							},
							onError: error => {
								toast.error(
									`Error adding member: ${
										error.response?.data?.message ||
										error.message
									}`
								);
								reject();
							},
						}
					);
				});
			},
			okText: 'Yes',
			cancelText: 'No',
		});
	};

	const items = [
		{
			label: 'Add Member',
			key: 'add-member',
			icon: <FaUserPlus />,
			onClick: showModal,
		},
		{
			type: 'divider',
		},
		{
			label: user.username === group.owner.username ? 'Delete Group' : 'Leave Group',
			key: 'delete-group',
			icon: user.username === group.owner.username ? <FaTrashAlt /> : <FaSignOutAlt />,
			onClick: () => {
				if (user.username === group.owner.username) {
					confirmDeleteGroup(group._id);
				} else {
					confirmLeaveGroup(group._id);
				}
			},
			danger: true,
		},
	];

	const handleRemoveMember = member => {
		if (user._id !== group.owner._id) {
			toast.error('Only the group owner can remove members!');
			return;
		}
		Modal.confirm({
			title: 'Confirm Member Removal',
			content: `Are you sure you want to remove ${member.name} (@${member.username}) from the group?`,
			onOk: () => {
				return new Promise((resolve, reject) => {
					removeMemberMutate(
						{ groupId: group._id, memberId: member._id },
						{
							onSuccess: () => {
								toast.success(
									`${member.name} has been removed from the group!`
								);
								resolve();
							},
							onError: error => {
								toast.error(
									`Error removing member: ${
										error.response?.data?.message ||
										error.message
									}`
								);
								reject();
							},
						}
					);
				});
			},
			okText: 'Yes',
			cancelText: 'No',
		});
	};

	const handleAddItem = () => {
		if (!newItem.trim()) return;
		addItemMutation.mutate({
			groupId: group._id,
			itemData: {
				title: newItem,
				addedBy: user._id,
			},
		});
		setNewItem('');
	};

	const handleRemoveItem = itemId => {
		removeItemMutation.mutate(itemId);
	};

	return (
		<div className='group-page'>
			<div className='group-header'>
				<h3>{group.name}</h3>
				<div className='group-actions'>
					<div className='owner'>
						<h3>Owner:</h3>
						<p>
							<span>
								{group?.owner?.name
									? group.owner.name[0].toUpperCase()
									: ''}
							</span>
							{group?.owner?.name
								? group.owner.name.charAt(0).toUpperCase() +
								  group.owner.name.slice(1)
								: 'Guest'}
							({group?.owner ? group.owner.username : 'No username'})
						</p>
					</div>
					<Dropdown
						menu={{ items }}
						trigger={['click']}
						overlayClassName='custom-dropdown'
					>
						<button
							onClick={e => e.preventDefault()}
							className='menu-btn-group'
						>
							<FaEllipsisV />
						</button>
					</Dropdown>
				</div>
			</div>
			<div className='group-content'>
				<div className='group-info'>
					<div className='group-description'>
						<h4>
							Items <span>{group.items.length}</span>
						</h4>
						<div className='group-items'>
							<input
								type='text'
								className='input'
								placeholder='Add Title'
								value={newItem}
								onChange={e => setNewItem(e.target.value)}
							/>
							<button className='add-item' onClick={handleAddItem}>
								<FaPlus />
							</button>
						</div>
					</div>
					<ul className='items-list'>
						{group.items.length > 0 ? (
							group.items.map((item, index) => (
								<li
									key={`${item._id}-${index}`}
									className='item-card'
								>
									<div className='avatar'>
										{item.title[0].toUpperCase()}
									</div>
									<div className='item-content'>
										<div className='item-title-wrapper'>
											<h4 className='item-title'>
												{item.title}
											</h4>
										</div>
										<p className='item-meta'>
											Created By{' '}
											{item.owner?.name
												.split(' ')
												.map(
													word =>
														word
															.charAt(0)
															.toUpperCase() +
														word.slice(1)
												)
												.join(' ') ||
												'Unknown'}{' '}
											(
											{new Date(
												item.createdAt
											).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
											,
											{new Date(
												item.createdAt
											).toLocaleDateString()}
											)
										</p>
									</div>
									<div className='item-actions'>
										{(user?._id === group?.owner?._id ||
											user?._id ===
												item?.owner?._id) && (
											<button
												className='btn red'
												onClick={() =>
													handleRemoveItem(
														item._id
													)
												}
											>
												<FaTimes />
											</button>
										)}
									</div>
								</li>
							))
						) : (
							<p>Hozircha hech qanday item yo'q.</p>
						)}
					</ul>
				</div>
				<div className='group-members'>
					<div className='group-description'>
						<h4>
							Members <span>{group.members.length}</span>
						</h4>
					</div>
					<ul className='members-list'>
						{group.members.map((member, index) => (
							<li key={`${member.id}-${index}`} className='member-item'>
								<div className='avatar'>
									{member.username[0].toUpperCase()}
								</div>
								<div className='member-info'>
									<span className='member-name'>
										{member.name}
									</span>
									<span className='member-username'>
										{member.username}
									</span>
								</div>
								{user._id === group.owner._id &&
									member._id !== group.owner._id && (
										<button
											className='remove-btn'
											onClick={() =>
												handleRemoveMember(member)
											}
										>
											<FaUserMinus />
										</button>
									)}
							</li>
						))}
					</ul>
				</div>
			</div>
			<Modal
				className='custom-modal'
				title='Add New Member'
				open={isModalOpen}
				onCancel={handleCancel}
				footer={[
					<Button key='cancel' onClick={handleCancel} className='cancel-btn'>
						Cancel
					</Button>,
				]}
				styles={{
					body: { height: '300px' },
					content: { maxWidth: '500px' },
				}}
			>
				<Input
					placeholder='Enter member name'
					value={member}
					onChange={e => setMember(e.target.value)}
					className='member-input'
				/>
				<List
					bordered
					dataSource={members}
					loading={isLoadingMember}
					renderItem={item => (
						<List.Item
							onClick={() => handleSelectMember(item)}
							style={{ cursor: 'pointer' }}
							className='member-item'
						>
							{item.username} (@{item.name})
						</List.Item>
					)}
					style={{
						marginTop: '10px',
						maxHeight: '250px',
						overflowY: 'auto',
						scrollbarWidth: 'none',
					}}
				/>
				{isErrorMember && <p style={{ color: 'red' }}>Error loading members</p>}
			</Modal>
		</div>
	);
}

export default GroupPage;
