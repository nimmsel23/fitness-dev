import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div className="p-8 bg-fit-red/10 text-fit-red rounded-3xl border border-fit-red/20 m-4">
        <h2 className="font-black mb-2 uppercase tracking-widest text-xs">Runtime Error</h2>
        <p className="text-sm opacity-80 font-bold">{this.state.error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-fit-red text-white rounded-xl text-xs font-black uppercase">Reload App</button>
      </div>
    );
    return this.props.children;
  }
}
