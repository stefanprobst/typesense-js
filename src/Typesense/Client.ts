import Configuration, { ConfigurationOptions } from './Configuration'
import ApiCall from './ApiCall'
import Collections from './Collections'
import Collection from './Collection'
import Aliases from './Aliases'
import Alias from './Alias'
import Keys from './Keys'
import Key from './Key'
import Debug from './Debug'
import Metrics from './Metrics'
import Health from './Health'
import Operations from './Operations'
import MultiSearch from './MultiSearch'

export default class Client {
  configuration: Configuration
  apiCall: ApiCall
  debug: Debug
  metrics: Metrics
  health: Health
  operations: Operations
  multiSearch: MultiSearch
  private readonly _collections: Collections
  private readonly individualCollections: Record<string, Collection>
  private readonly _aliases: Aliases
  private readonly individualAliases: Record<string, Alias>
  private readonly _keys: Keys
  private readonly individualKeys: Record<number, Key>

  constructor(options: ConfigurationOptions) {
    this.configuration = new Configuration(options)
    this.apiCall = new ApiCall(this.configuration)
    this.debug = new Debug(this.apiCall)
    this.metrics = new Metrics(this.apiCall)
    this.health = new Health(this.apiCall)
    this.operations = new Operations(this.apiCall)
    this.multiSearch = new MultiSearch(this.apiCall, this.configuration)
    this._collections = new Collections(this.apiCall)
    this.individualCollections = {}
    this._aliases = new Aliases(this.apiCall)
    this.individualAliases = {}
    this._keys = new Keys(this.apiCall)
    this.individualKeys = {}
  }

  collections(): Collections
  collections<T extends Record<string, any> = {}>(collectionName: string): Collection<T>
  collections(collectionName?: string): Collections | Collection {
    if (collectionName === undefined) {
      return this._collections
    } else {
      if (this.individualCollections[collectionName] === undefined) {
        this.individualCollections[collectionName] = new Collection(collectionName, this.apiCall, this.configuration)
      }
      return this.individualCollections[collectionName]
    }
  }

  aliases(): Aliases
  aliases(aliasName: string): Alias
  aliases(aliasName?: string): Aliases | Alias {
    if (aliasName === undefined) {
      return this._aliases
    } else {
      if (this.individualAliases[aliasName] === undefined) {
        this.individualAliases[aliasName] = new Alias(aliasName, this.apiCall)
      }
      return this.individualAliases[aliasName]
    }
  }

  keys(): Keys
  keys(id: number): Key
  keys(id?: number): Keys | Key {
    if (id === undefined) {
      return this._keys
    } else {
      if (this.individualKeys[id] === undefined) {
        this.individualKeys[id] = new Key(id, this.apiCall)
      }
      return this.individualKeys[id]
    }
  }
}
