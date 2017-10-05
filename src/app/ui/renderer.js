'use strict'

var $ = require('jquery')

/**
 * After refactor, the renderer is only used to render error/warning
 * TODO: This don't need to be an object anymore. Simplify and just export the renderError function.
 *
 */
function Renderer (appAPI) {
  this.appAPI = appAPI
}

Renderer.prototype.error = function (message, container, options) {
  if (container === undefined) return
  var self = this
  var opt = options || {}
  var $pre
  if (opt.isHTML) {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').html(message.formattedMessage)
  } else {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').text(message.formattedMessage)
  }
  var $error = $('<div class="sol ' + message.severity + '"><div class="close"><i class="fa fa-close"></i></div></div>').prepend($pre)
  container.append($error)
  var err = message.formattedMessage.match(/^([^:]*):([0-9]*):(([0-9]*):)? /)
  if (err) {
    var errFile = err[1]
    var errLine = parseInt(err[2], 10) - 1
    var errCol = err[4] ? parseInt(err[4], 10) : 0
    if (!opt.noAnnotations) {
      self.appAPI.error(errFile, {
        row: errLine,
        column: errCol,
        text: message.formattedMessage,
        type: message.severity
      })
    }
    $error.click(function (ev) {
      options && options.click ? options.click(errFile, errLine, errCol) : self.appAPI.errorClick(errFile, errLine, errCol)
    })
  } else if (options && options.click) {
    $error.click(function (ev) {
      options.click(message.formattedMessage)
    })
  }

  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

module.exports = Renderer
