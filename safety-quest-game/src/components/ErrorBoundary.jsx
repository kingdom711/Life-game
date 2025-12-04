import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
                    <h1>⚠️ 오류가 발생했습니다.</h1>
                    <p>죄송합니다. 앱을 실행하는 도중 문제가 발생했습니다.</p>
                    <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '1rem', overflow: 'auto' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                    >
                        앱 재시작
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
