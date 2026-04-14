import Card from '../game/Card';
import './rules.scss';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Rules() {
    const [isCardClicked, setIsCardClicked] = useState(false);
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    }

    const handleCardClick = () => {
        setIsCardClicked(!isCardClicked);
    }

    return (
        <div className="rules">
            <div className="header">
                <button className="back" type="button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                </button>
                <div className="titles">
                    <h1 className="title">Comment jouer à Punto</h1>
                    <div className="subtitle">Un jeu de cartes rapide et stratégique pour 2 à 4 joueurs</div>
                </div>
            </div>
            <div className="content">
                <section className="rules-section objective">
                    <div className="section-head">
                        <div className="icon green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        </div>
                        <div className="section-title">Objectif</div>
                    </div>
                    <div className="section-content">
                        <span>Être le premier joueur à remporter <span className="highlight">2 manches</span>.</span>
                        <span>Pour gagner une manche, tu dois réussir à aligner :</span>
                        <ul>
                            <li><span><span className="highlight">4</span> cartes de la même couleur</span></li>
                            <li><span><span className="highlight">horizontalement</span>, <span className="highlight">verticalement</span> ou en <span className="highlight">diagonale</span></span></li>
                        </ul>
                    </div>
                </section>
                <section className="rules-section setup">
                    <div className="section-head">

                        <div className="icon blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="section-title">Mise en place</div>
                    </div>
                    <div className="section-content">
                        <span>Le jeu contient <span className="highlight">72 cartes</span> réparties en <span className="highlight">4 couleurs</span>.</span>
                        <span>Chaque couleur possède les valeurs <span className="highlight">1</span> à <span className="highlight">9</span> en double.</span>
                        <span>Répartition des cartes :</span>
                        <div className="card-distribution-container">
                            <div className="2 players players-distribution">
                                <div className="header">
                                    <span className="icon blue">2</span>
                                    joueurs
                                </div>
                                <div className="content">
                                    <div className="player">
                                        <div className="color-indicator red"></div>
                                        <div className="color-indicator blue"></div>
                                        <span>Joueur 1 (36)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator green"></div>
                                        <div className="color-indicator orange"></div>
                                        <span>Joueur 2 (36)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="3 players players-distribution">
                                <div className="header">
                                    <span className="icon yellow">3</span>
                                    joueurs
                                </div>
                                <div className="content">
                                    <div className="player">
                                        <div className="color-indicator red"></div>
                                        <div className="color-indicator blue"></div>
                                        <span>Joueur 1 (24)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator green"></div>
                                        <div className="color-indicator blue"></div>
                                        <span>Joueur 2 (24)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator orange"></div>
                                        <div className="color-indicator blue"></div>
                                        <span>Joueur 3 (24)</span>
                                    </div>
                                </div>
                                <div className="footer">
                                    <span className="highlight">Remarque :</span>
                                    <span>Dans une partie a 3 joueurs, la quatrième couleur voit ses cartes partagées entre tous les joueurs.</span>
                                </div>
                            </div>
                            <div className="4 players players-distribution">
                                <div className="header">
                                    <span className="icon green">4</span>
                                    joueurs
                                </div>
                                <div className="content">
                                    <div className="player">
                                        <div className="color-indicator red"></div>
                                        <span>Joueur 1 (18)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator green"></div>
                                        <span>Joueur 2 (18)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator orange"></div>
                                        <span>Joueur 3 (18)</span>
                                    </div>
                                    <div className="player">
                                        <div className="color-indicator blue"></div>
                                        <span>Joueur 4 (18)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="rules-section gameplay">
                    <div className="section-head">
                        <div className="icon orange">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
                        </div>
                        <div className="section-title">Gameplay</div>
                    </div>
                </section>
                <section className="rules-section gameplay">
                    <div className="section-head">
                        <div className="icon red">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                        </div>
                        <div className="section-title">Capture de cartes</div>
                    </div>
                    <div className="section-content">
                        <span>Vous pouvez capturer une carte de votre <span className="highlight">adversaire</span> en jouant une carte de valeur <span className="highlight">supérieure</span> à celle-ci.</span>
                        <div className="superposed-cards">
                            <div className="info-card">
                                <div className="card-content">
                                    <Card card={{ number: '9', cardColor: 'blue', clickable: false, playerColor: '' }} />
                                </div>
                                <div className="card-info">
                                    Votre carte
                                </div>
                            </div>
                            <div className="vertical-separator"></div>
                            {
                                isCardClicked ? (
                                    <div className="opponent">
                                        <div className="info-card">
                                            <div className="card-content" onClick={handleCardClick}>
                                                <Card card={{ number: '5', cardColor: 'red', clickable: true, playerColor: 'blue' }} />
                                            </div>
                                            <div className="card-info">
                                                Carte de l'adversaire
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="opponent">
                                        <div className="info-card">
                                            <div className="card-content">
                                                <Card card={{ number: '9', cardColor: 'blue', clickable: false, playerColor: '' }} />
                                            </div>
                                            <div className="card-info">
                                                Votre carte
                                                <svg className="replay" onClick={handleCardClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <div className="section-footer">
                            <span className="highlight">Remarque :</span>
                            <span>cliquez sur la carte <span className="highlight red">rouge</span></span>
                        </div>
                    </div>
                </section>
                <section className="rules-section gameplay">
                    <div className="section-head">
                        <div className="icon green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>
                        </div>
                        <div className="section-title">Gagner la partie</div>
                    </div>
                </section>
                <section className="rules-section tips">
                    <div className="section-head">
                        <svg className="protips" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                        <div className="section-title">Protips</div>
                    </div>
                    <div className="section-content">
                        <ul>
                            <li><span>Anticipe les mouvements de tes adversaires pour bloquer leurs alignements.</span></li>
                            <li><span>Utilise les cartes de la quatrième couleur (en mode 3 joueurs) pour surprendre tes adversaires.</span></li>
                            <li><span>Garde un œil sur les cartes déjà jouées pour mieux planifier tes coups.</span></li>
                        </ul>
                    </div>
                </section>
            </div >
            <div className="footer"></div>
        </div >
    );
}

export default Rules;