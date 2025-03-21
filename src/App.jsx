import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routers';
import './styles/main.scss';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Toaster
				position='top-right'
				toastOptions={{
					duration: 3000,
					style: {
						background: '#333',
						color: '#fff',
					},
					success: {
						duration: 3000,
						theme: {
							primary: '#4f46e5',
						},
					},
					error: {
						duration: 4000,
						theme: {
							primary: '#ef4444',
						},
					},
				}}
			/>
			<AppRoutes />
		</QueryClientProvider>
	);
}

export default App;
