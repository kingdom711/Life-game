import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            await login({ username: email, password }); // 백엔드는 username 필드를 기대함
            navigate('/'); // Redirect to dashboard/home after login
        } catch (err) {
            setLoginError(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page flex items-center justify-center min-h-screen px-4 sm:px-6">
            <div className="container w-full" style={{ maxWidth: '500px' }}>
                <div className="card animate-fadeIn w-full">
                    <div className="card-header text-center">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-light)' }}>
                            로그인
                        </h1>
                        <p className="text-muted">안전 퀘스트를 계속하려면 로그인하세요</p>
                    </div>

                    <div className="card-body">
                        {loginError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
                                {loginError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    아이디 (이메일)
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="이메일을 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full mt-4"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="spinner w-4 h-4 border-2"></div>
                                        로그인 중...
                                    </span>
                                ) : (
                                    '로그인'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="card-footer justify-center border-t border-slate-700/50 pt-6 mt-2">
                        <p className="text-sm text-slate-400 mb-0">
                            계정이 없으신가요?{' '}
                            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                                회원가입
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
