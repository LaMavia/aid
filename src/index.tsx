import React from 'react'
import { render } from 'react-dom'

import App from '@/app'
import configureStore, { history } from './store/configStore'
import { DEFAULT_STATE as langState } from './store/reducers/lang'
import authUser from './store/async/authUser'

const DOM_NODE: HTMLElement = document.querySelector('.appWrapper')

const store = configureStore({
  user:
    process.env.NODE_ENV !== 'production'
      ? {
          loggedIn: true,
          info: { name: 'Mi Nombre', lastname: 'Apellido', email: 'e@mail.com' }
        }
      : { loggedIn: false },
  lang: langState
})

authUser(store)

render(
  <>
    <App store={store} history={history} />
  </>,
  DOM_NODE
)

/**
 * Service worker register and event listeners
 */
const registerSw = async (): Promise<ServiceWorkerRegistration> => {
  const { Workbox } = await import(/* webpackChunkName: 'workbox-window' */ 'workbox-window')

  const wb = new Workbox('/service-worker.js')

  return wb.register()
}

const initServices = async () => {
  if (process.env.NODE_ENV === 'production') {
    if ('serviceWorker' in navigator) {
      await registerSw()
    }
  }
}

initServices()
