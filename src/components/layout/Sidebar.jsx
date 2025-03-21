import { useCreateGroup, useMyGroups } from '@/hooks/useGroups';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Button, Collapse, Form, Input, List, Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FaPlus, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar() {
	const { darkMode } = useTheme();
	const user = useStore(state => state.user);
	const groups = useStore(state => state.groups);
	const [modalOpen, setModalOpen] = useState(false);
	const [form] = Form.useForm();
	const createGroup = useCreateGroup();

	const { myGroups, isLoadingMyGroups, refetch } = useMyGroups();
	const [joinedGroups, setJoinedGroups] = useState([]);

	const prevGroupsRef = useRef(myGroups);

	useEffect(() => {
		if (prevGroupsRef.current !== myGroups) {
			setJoinedGroups(myGroups);
			prevGroupsRef.current = myGroups;
		}
	}, [myGroups]);

	const navigate = useNavigate();
	const handleNavigation = path => {
		navigate(path);
	};

	const handleAddGroup = async values => {
		try {
			const existingGroup = myGroups.find(group => group.name === values.name);
			if (existingGroup) {
				message.error('A group with this name already exists!');
				return;
			}
			await createGroup.mutateAsync({ name: values.name, password: values.password });
			form.resetFields();
			setModalOpen(false);
			await refetch();
		} catch (error) {
			console.error('Error creating group:', error.response?.data || error.message);
			message.error(`Error: ${error.response?.data?.message || 'Unknown error'}`);
		}
	};

	return (
		<div className={`sidebar ${darkMode ? 'dark' : ''}`}>
			<Link className='logo' to='/'>
				Shopping List
			</Link>

			<Collapse
				style={{ marginTop: '10px' }}
				className='sidebar-collapse'
				defaultActiveKey={['1']}
				items={[
					{
						key: '1',
						label: (
							<div className='collapse-label'>
								<FaUsers /> Groups
							</div>
						),
						children: (
							<>
								<Button
									type='primary'
									icon={<FaPlus />}
									block
									style={{ marginBottom: '10px' }}
									onClick={() => setModalOpen(true)}
								>
									Add Group
								</Button>

								<List
									style={{ overflow: 'hidden' }}
									size='small'
									bordered
									loading={isLoadingMyGroups}
									dataSource={[
										...(groups || []),
										...(myGroups || []),
									]}
									renderItem={group => (
										<List.Item
											onClick={() =>
												navigate(
													`/groups/${
														group._id ||
														'default'
													}`
												)
											}
											style={{ cursor: 'pointer' }}
											className='group-item'
										>
											<strong>
												{group?.name || 'No Name'}
											</strong>
										</List.Item>
									)}
								/>
							</>
						),
					},
				]}
			/>

			<Modal
				title='Add New Group'
				open={modalOpen}
				onCancel={() => setModalOpen(false)}
				footer={null}
				className='custom-modal'
				width={400}
			>
				<Form form={form} onFinish={handleAddGroup} layout='vertical'>
					<Form.Item
						name='name'
						label='Group Name'
						rules={[
							{
								required: true,
								message: 'Please enter the group name!',
							},
						]}
					>
						<Input placeholder='Enter group name...' />
					</Form.Item>
					<Form.Item
						name='password'
						label='Group Password'
						rules={[
							{
								required: true,
								message: 'Please enter the group password!',
							},
						]}
					>
						<Input.Password
							placeholder='Enter password...'
							style={{ padding: '8px' }}
						/>
					</Form.Item>
					<Button type='primary' htmlType='submit' block>
						Add
					</Button>
				</Form>
			</Modal>
		</div>
	);
}

export default Sidebar;
