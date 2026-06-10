import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }
  static getDerivedStateFromError(e: Error) { return { hasError: true, error: e } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">页面出错了</h2>
          <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
          <pre className="text-xs text-left bg-gray-100 p-3 rounded max-h-40 overflow-auto">
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
