import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import '../font.module.css'
import Settings from '../containers/settings'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Settings />
    </QueryClientProvider>
  </React.StrictMode>,
) 