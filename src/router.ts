import type { Middleware } from 'koa-compose'
import compose from 'koa-compose'
import type { IExtendableContext } from './context'
import { pathToRegexp } from 'path-to-regexp'

export interface ILayer<ContextT = {}> {
  path?: string
  middleware: Middleware<ContextT & IExtendableContext>
  match(url: string): boolean
  regexp?: RegExp
}

export interface IRouterOptions {
  prefix?: string
}
export class Router<ContextT = {}> {
  stack: ILayer<ContextT>[]
  options: IRouterOptions
  constructor (options?: IRouterOptions) {
    this.stack = []
    this.options = options || {}
  }

  get prefix () {
    return this.options.prefix || ''
  }

  use (
    path: string | Middleware<ContextT & IExtendableContext>,
    fn?: Middleware<ContextT & IExtendableContext>
  ) {
    if (typeof path === 'string') {
      if (typeof fn === 'function') {
        this.stack.push({
          path,
          regexp: pathToRegexp([this.prefix, path].join('/'), [], {
            end: false
          }),
          middleware: fn,
          match (url) {
            return this.regexp!.test(url)
          }
        })
      } else {
        console.error('Please comfirm fn is Function')
      }
    } else if (typeof path === 'function') {
      fn = path
      this.stack.push({
        middleware: fn,
        match (_url) {
          return true
        }
      })
    }
  }

  routes () {
    const router = this

    const prefixReg = pathToRegexp(this.prefix, [], {
      end: false
    })
    const dispatch: Middleware<ContextT & IExtendableContext> & {
      router: Router<ContextT>
    } = function (ctx, next) {
      if (prefixReg.test(ctx.url)) {
        const matchedLayers = router.match(ctx.url)
        const layerChain = matchedLayers.reduce<
          Middleware<ContextT & IExtendableContext>[]
        >((acc, cur) => {
          acc.push(cur.middleware)
          return acc
        }, [])

        return compose(layerChain)(ctx, next)
      }
      next()
    }
    dispatch.router = router
    return dispatch
  }

  match (url: string) {
    const layers = this.stack
    return layers.filter((x) => x.match(url))
  }
}
