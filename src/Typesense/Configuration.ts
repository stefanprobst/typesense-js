import * as logger from 'loglevel'
import { MissingConfigurationError } from './Errors'

export interface NodeConfiguration {
  host: string
  port: number
  protocol: string
  path?: string
  url?: string
}

export interface ConfigurationOptions {
  apiKey: string
  nodes: NodeConfiguration[]
  randomizeNodes: boolean
  /**
   * @deprecated
   * masterNode is now consolidated to nodes, starting with Typesense Server v0.12'
   */
  masterNode?: NodeConfiguration
  /**
   * @deprecated
   * readReplicaNodes is now consolidated to nodes, starting with Typesense Server v0.12'
   */
  readReplicaNodes?: NodeConfiguration[]
  nearestNode?: NodeConfiguration
  connectionTimeoutSeconds?: number
  timeoutSeconds?: number
  healthcheckIntervalSeconds?: number
  numRetries?: number
  retryIntervalSeconds?: number
  sendApiKeyAsQueryParam?: boolean
  useServerSideSearchCache?: boolean
  cacheSearchResultsForSeconds?: number
  additionalHeaders?: Record<string, string>

  logLevel?: logger.LogLevelDesc
  logger?: any //todo
}

export default class Configuration {
  readonly nodes: NodeConfiguration[]
  readonly nearestNode: NodeConfiguration
  readonly connectionTimeoutSeconds: number
  readonly healthcheckIntervalSeconds: number
  readonly numRetries: number
  readonly retryIntervalSeconds: number
  readonly apiKey: string
  readonly sendApiKeyAsQueryParam: boolean
  readonly cacheSearchResultsForSeconds: number
  readonly useServerSideSearchCache: boolean
  readonly logger: any
  readonly logLevel: any
  readonly additionalHeaders: Record<string, string>

  constructor(options: ConfigurationOptions) {
    this.nodes = options.nodes || []
    this.nodes = this.nodes
      .map((node) => this.setDefaultPathInNode(node))
      .map((node) => this.setDefaultPortInNode(node))
      .map((node) => ({ ...node })) // Make a deep copy

    if (options.randomizeNodes == null) {
      options.randomizeNodes = true
    }

    if (options.randomizeNodes === true) {
      this.shuffleArray(this.nodes)
    }

    this.nearestNode = options.nearestNode || null
    this.nearestNode = this.setDefaultPathInNode(this.nearestNode)
    this.nearestNode = this.setDefaultPortInNode(this.nearestNode)

    this.connectionTimeoutSeconds = options.connectionTimeoutSeconds || options.timeoutSeconds || 5
    this.healthcheckIntervalSeconds = options.healthcheckIntervalSeconds || 60
    this.numRetries = options.numRetries || this.nodes.length + (this.nearestNode == null ? 0 : 1) || 3
    this.retryIntervalSeconds = options.retryIntervalSeconds || 0.1

    this.apiKey = options.apiKey
    this.sendApiKeyAsQueryParam = options.sendApiKeyAsQueryParam || false

    this.cacheSearchResultsForSeconds = options.cacheSearchResultsForSeconds || 0 // Disable client-side cache by default
    this.useServerSideSearchCache = options.useServerSideSearchCache || false

    this.logger = options.logger || logger
    this.logLevel = options.logLevel || 'warn'
    this.logger.setLevel(this.logLevel)

    this.additionalHeaders = options.additionalHeaders

    this.showDeprecationWarnings(options)
    this.validate()
  }

  validate(): boolean {
    if (this.nodes == null || this.nodes.length === 0 || this.validateNodes()) {
      throw new MissingConfigurationError('Ensure that nodes[].protocol, nodes[].host and nodes[].port are set')
    }

    if (this.nearestNode != null && this.isNodeMissingAnyParameters(this.nearestNode)) {
      throw new MissingConfigurationError(
        'Ensure that nearestNodes.protocol, nearestNodes.host and nearestNodes.port are set'
      )
    }

    if (this.apiKey == null) {
      throw new MissingConfigurationError('Ensure that apiKey is set')
    }

    return true
  }

  private validateNodes(): boolean {
    return this.nodes.some((node) => {
      return this.isNodeMissingAnyParameters(node)
    })
  }

  private isNodeMissingAnyParameters(node: NodeConfiguration): boolean {
    return (
      !['protocol', 'host', 'port', 'path'].every((key) => {
        return node.hasOwnProperty(key)
      }) && node.url == null
    )
  }

  private setDefaultPathInNode(node: NodeConfiguration): NodeConfiguration {
    if (node != null && !node.hasOwnProperty('path')) {
      node.path = ''
    }
    return node
  }

  private setDefaultPortInNode(node: NodeConfiguration): NodeConfiguration {
    if (node != null && !node.hasOwnProperty('port') && node.hasOwnProperty('protocol')) {
      switch (node.protocol) {
        case 'https':
          node.port = 443
          break
        case 'http':
          node.port = 80
          break
      }
    }
    return node
  }

  private showDeprecationWarnings(options: ConfigurationOptions): void {
    if (options.timeoutSeconds) {
      this.logger.warn('Deprecation warning: timeoutSeconds is now renamed to connectionTimeoutSeconds')
    }
    if (options.masterNode) {
      this.logger.warn(
        'Deprecation warning: masterNode is now consolidated to nodes, starting with Typesense Server v0.12'
      )
    }
    if (options.readReplicaNodes) {
      this.logger.warn(
        'Deprecation warning: readReplicaNodes is now consolidated to nodes, starting with Typesense Server v0.12'
      )
    }
  }

  private shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
}
