import { Router, App } from '../src'
import type { ICloudbaseContext, ICloudbaseEvent, IRouterOptions } from '../src'

export function createApp () {
  return new App()
}

export function createRouter (options?: IRouterOptions) {
  return new Router(options)
}

export function createCloudContext (): ICloudbaseContext {
  return {}
}

export function createCloudEvent (
  url?: string,
  data?: Record<string, any>
): ICloudbaseEvent {
  return {
    $url: url,
    data
  }
}