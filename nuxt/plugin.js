/** @type {import('@nuxt/types').Plugin} */
export default (ctx, inject) => {
  function mande(wrappedFn, ...args) {
    return (
      wrappedFn(
        /** @type {import('../src').MandeInstance} */
        (api) => {
          // the plugin can be called during dev in client side with no context
          if (!ctx.req) return

          const reqHeaders = { ...ctx.req.headers }

          const proxyHeadersIgnore =
            // comment easier
            <%= serialize(options.proxyHeadersIgnore) %> ||
            [
              'accept',
              'host',
              'cf-ray',
              'cf-connecting-ip',
              'content-length',
              'content-md5',
              'content-type',
            ]

          // @ts-ignore
          for (let header of proxyHeadersIgnore) {
            delete reqHeaders[header]
          }

          api.options.headers = { ...api.options.headers, ...reqHeaders }

          if (process.server) {
            // Don't accept brotli encoding because Node can't parse it
            api.options.headers['accept-encoding'] = 'gzip, deflate'
          }
        },
        ...args
      )
      <% if (options.callError) { %>
        .catch((err) => {
          return err.response.json().then((body) => {
            const errorObject = { statusCode: err.response.status, message: err.message, body }
            ctx.error(errorObject)
            return errorObject
          })
        })
      <% } %>
    )
  }

  ctx.mande = mande
  inject('mande', mande)
}