import './rules.scss';
import { useNavigate } from 'react-router-dom';

function Rules() {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    }

    return (
        <div className="rules">
            <div className="header">
                <button className="back" type="button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                </button>
                <div className="titles">
                    <h1 className="title">Comment jouer</h1>
                    <div className="subtitle">Découvrez les règles du jeu et comment marquer des points pour gagner la partie !</div>
                </div>
            </div>
            <div className="content"></div>
            <div className="footer"></div>
        </div>
    );
}

export default Rules;