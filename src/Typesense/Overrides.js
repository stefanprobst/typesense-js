'use strict'

import ApiCall from './ApiCall'
import Collections from './Collections'

const RESOURCEPATH = '/overrides'

class Overrides {
  constructor (configuration, collectionName) {
    this._configuration = configuration
    this._collectionName = collectionName
  }

  create (overrideId, query, matchType, includes = [], excludes = []) {
    return (new ApiCall(this._configuration)).put(this._endpointPath(), {
      id: overrideId,
      rule: {
        query: query,
        match: matchType
      },
      includes,
      excludes
    })
  }

  retrieve () {
    return new ApiCall(this._configuration).get(this._endpointPath())
  }

  _endpointPath (operation) {
    return `${Collections.RESOURCEPATH}/${this._collectionName}${Overrides.RESOURCEPATH}`
  }

  static get RESOURCEPATH () {
    return RESOURCEPATH
  }
}

module.exports = Overrides
