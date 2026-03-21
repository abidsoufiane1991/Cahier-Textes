import { HeaderInfo, Session } from './types';

export const COMMON_OBSERVATIONS = [
  "Objectif atteint",
  "Objectif partiellement atteint",
  "Non atteint, à revoir",
  "Bonne participation",
  "Manque d'implication",
  "Difficultés techniques observées",
  "Excellente dynamique de groupe",
  "Séance perturbée (météo/autre)",
  "Évaluation reportée",
  "Nécessite plus de temps"
];

export const INITIAL_HEADER: HeaderInfo = {
  teacher: "SOUFIANE ABID",
  niveauScolaire: "Tronc commun",
  moduleEnseignement: "Équilibre moteur et intégration par la pratique sportive",
  familleAPS: "Sports de renvoi",
  apsSupport: "Volleyball",
  classe: ".........",
  schoolName: "ثانوية الزرقطوني التأهيلية",
  directorateName: "مديرية بني ملال",
  schoolYear: "الموسم الدراسي 2025 | 2026"
};

export const MODULES_BY_LEVEL: Record<string, string[]> = {
  "Tronc Commun": [
    "Gestion de l’effort physique",
    "équilibre moteur et intégration par le sport."
  ],
  "1ère année bac": [
    "Engagement moteur et efficience sportive",
    "Effort physique et performance sportive"
  ],
  "2ème année bac": [
    "Efficacité et créativité motrice et sportive",
    "Prise d’initiative et pratique physique et sportive responsable"
  ]
};

export const APS_BY_FAMILY: Record<string, string[]> = {
  "Sports de renvoi": [
    "Volleyball",
    "Tennis",
    "Tennis de table",
    "Badminton"
  ],
  "Sports Collectifs Marquage - démarquage": [
    "Handball",
    "Basketball",
    "Football",
    "Rugby",
    "Ultimate Frisbee"
  ],
  "Athlétisme": [
    "Course de vitesse",
    "Course de demi-fond",
    "Course de haies",
    "Course de relais",
    "Saut en longueur",
    "Saut en hauteur",
    "Triple saut"
  ],
  "Gymnastique": [
    "Gym au sol",
    "Acrogym"
  ],
  "Sports de stratégie": [
    "Échecs"
  ]
};

export const INITIAL_SESSIONS: Session[] = [
  { id: '1', sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Détecter le niveau initial des élèves sur le plan individuel et collectif', date: '', duree: '1h', bilan: '', completed: false },
  { id: '2', sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Expliquer les fondamentaux et enrichir les connaissances et le règlement de base de l\'APS', date: '', duree: '1h', bilan: '', completed: false },
  { id: '3', sequence: 'Organisation collective pour récupérer la balle', seanceNumber: 3, objectif: 'Se placer et se déplacer pour intercepter la balle et l\'orienter vers le partenaire', date: '', duree: '1h', bilan: '', completed: false },
  { id: '4', sequence: 'Organisation collective pour récupérer la balle', seanceNumber: 4, objectif: 'Se placer et se déplacer pour intercepter la balle et l\'orienter vers le partenaire', date: '', duree: '1h', bilan: '', completed: false },
  { id: '5', sequence: 'Organisation collective pour récupérer la balle', seanceNumber: 5, objectif: 'Se placer et se déplacer pour intercepter la balle et l\'orienter vers le partenaire', date: '', duree: '1h', bilan: '', completed: false },
  { id: '6', sequence: 'Organisation collective pour récupérer la balle', seanceNumber: 6, objectif: 'Se placer et se déplacer pour intercepter la balle et l\'orienter vers le partenaire', date: '', duree: '1h', bilan: '', completed: false },
  { id: '7', sequence: 'Séance d’intégration', seanceNumber: 7, objectif: 'Mobilisation des acquisitions précédentes', date: '', duree: '1h', bilan: '', completed: false },
  { id: '8', sequence: 'Utilisation des 3 touches de balle pour assurer la continuité du jeu', seanceNumber: 8, objectif: 'Coordonner ses actions pour utiliser les 3 touches et renvoyer la balle', date: '', duree: '1h', bilan: '', completed: false },
  { id: '9', sequence: 'Utilisation des 3 touches de balle pour assurer la continuité du jeu', seanceNumber: 9, objectif: 'Coordonner ses actions pour utiliser les 3 touches et renvoyer la balle', date: '', duree: '1h', bilan: '', completed: false },
  { id: '10', sequence: 'Utilisation des 3 touches de balle pour assurer la continuité du jeu', seanceNumber: 10, objectif: 'Coordonner ses actions pour utiliser les 3 touches et renvoyer la balle', date: '', duree: '1h', bilan: '', completed: false },
  { id: '11', sequence: 'Utilisation des 3 touches de balle pour assurer la continuité du jeu', seanceNumber: 11, objectif: 'Coordonner ses actions pour utiliser les 3 touches et renvoyer la balle', date: '', duree: '1h', bilan: '', completed: false },
  { id: '12', sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Déterminer le degré d’acquisition final des élèves sur le plan individuel et collectif', date: '', duree: '1h', bilan: '', completed: false },
];

export const VOLLEYBALL_SESSIONS_BY_LEVEL: Record<string, Omit<Session, 'id' | 'date' | 'bilan' | 'completed'>[]> = {
  "Tronc Commun": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Identifier le niveau technique et la capacité à coopérer pour maintenir l’échange', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Règles de base, fair-play et esprit d’équipe en volleyball', duree: '1h' },
    { sequence: 'Coopération défensive', seanceNumber: 3, objectif: 'S’organiser collectivement pour réceptionner et orienter la balle vers le passeur', duree: '1h' },
    { sequence: 'Coopération défensive', seanceNumber: 4, objectif: 'Communiquer pour éviter les zones de conflit et sécuriser le terrain', duree: '1h' },
    { sequence: 'Coopération défensive', seanceNumber: 5, objectif: 'Soutenir ses partenaires lors des phases de réception difficile', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Auto-évaluer son implication dans la solidarité défensive', duree: '1h' },
    { sequence: 'Continuité du jeu', seanceNumber: 7, objectif: 'Utiliser les 3 touches de balle pour construire une attaque collective', duree: '1h' },
    { sequence: 'Continuité du jeu', seanceNumber: 8, objectif: 'Valoriser le rôle du passeur pour faciliter le travail de l’attaquant', duree: '1h' },
    { sequence: 'Continuité du jeu', seanceNumber: 9, objectif: 'Respecter le rythme de ses partenaires pour assurer la fluidité du jeu', duree: '1h' },
    { sequence: 'Continuité du jeu', seanceNumber: 10, objectif: 'Favoriser l’inclusion de tous les joueurs dans la construction du point', duree: '1h' },
    { sequence: 'Continuité du jeu', seanceNumber: 11, objectif: 'Pratique de matchs centrés sur l’entraide et le respect de l’adversaire', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Bilan final : Coopération, Maîtrise technique et Esprit Sportif', duree: '1h' },
  ],
  "1ère année bac": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Evaluer l’efficacité tactique et la gestion des rôles sociaux', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Systèmes de jeu et importance de la communication stratégique', duree: '1h' },
    { sequence: 'Organisation tactique', seanceNumber: 3, objectif: 'Coordonner son placement pour couvrir les zones vulnérables du terrain', duree: '1h' },
    { sequence: 'Organisation tactique', seanceNumber: 4, objectif: 'Anticiper les trajectoires adverses en s’appuyant sur ses partenaires', duree: '1h' },
    { sequence: 'Organisation tactique', seanceNumber: 5, objectif: 'Assumer son rôle spécifique au service du projet collectif', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Co-évaluer la fluidité et l’entraide au sein de l’équipe', duree: '1h' },
    { sequence: 'Construction offensive', seanceNumber: 7, objectif: 'Varier les attaques pour déstabiliser l’adversaire avec intelligence', duree: '1h' },
    { sequence: 'Construction offensive', seanceNumber: 8, objectif: 'Maîtriser le soutien au contre pour sécuriser la défense', duree: '1h' },
    { sequence: 'Construction offensive', seanceNumber: 9, objectif: 'Gérer les moments de pression avec calme et solidarité', duree: '1h' },
    { sequence: 'Construction offensive', seanceNumber: 10, objectif: 'Prendre l’information collective pour jouer vite et juste', duree: '1h' },
    { sequence: 'Construction offensive', seanceNumber: 11, objectif: 'Matchs de préparation favorisant le leadership positif', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Performance collective et respect de l’éthique sportive', duree: '1h' },
  ],
  "2ème année bac": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Analyse de l’organisation collective et du leadership responsable', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Stratégies avancées et gestion éthique de la compétition', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 3, objectif: 'Maintenir l’équilibre du bloc équipe par un placement autonome', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 4, objectif: 'Adapter sa stratégie en fonction des forces de l’adversaire', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 5, objectif: 'Favoriser l’autonomie des joueurs dans la gestion du match', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Analyser son propre impact sur la dynamique et l’ambiance d’équipe', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 7, objectif: 'Encadrer et conseiller ses partenaires pour élever le niveau collectif', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 8, objectif: 'Gérer l’intensité du jeu tout en préservant l’intégrité des joueurs', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 9, objectif: 'Utiliser les temps morts pour réorganiser la tactique avec sérénité', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 10, objectif: 'Rechercher l’excellence technique au service d’un jeu fluide', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 11, objectif: 'Finalisation du projet de jeu pour le tournoi de fin de cycle', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Bilan final : Leadership, Stratégie et Engagement Citoyen', duree: '1h' },
  ]
};

export const HANDBALL_SESSIONS_BY_LEVEL: Record<string, Omit<Session, 'id' | 'date' | 'bilan' | 'completed'>[]> = {
  "Tronc Commun": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Identifier le niveau technique et la capacité à coopérer en équipe', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Règles d’or, fair-play et respect de l’arbitre', duree: '1h' },
    { sequence: 'Conserver le ballon', seanceNumber: 3, objectif: 'Se démarquer pour offrir des solutions de passe et conserver le ballon', duree: '1h' },
    { sequence: 'Conserver le ballon', seanceNumber: 4, objectif: 'Coopérer avec ses partenaires pour sortir de la zone de pression', duree: '1h' },
    { sequence: 'Conserver le ballon', seanceNumber: 5, objectif: 'Communiquer pour organiser la circulation collective du ballon', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Auto-évaluer son implication dans le jeu collectif et le respect des autres', duree: '1h' },
    { sequence: 'Progresser vers le but', seanceNumber: 7, objectif: 'Utiliser le jeu en mouvement pour progresser vers la zone adverse', duree: '1h' },
    { sequence: 'Progresser vers le but', seanceNumber: 8, objectif: 'Coordonner les montées rapides en impliquant tout le collectif', duree: '1h' },
    { sequence: 'Progresser vers le but', seanceNumber: 9, objectif: 'Valoriser le travail des ailiers pour étirer la défense adverse', duree: '1h' },
    { sequence: 'Progresser vers le but', seanceNumber: 10, objectif: 'S’organiser pour tirer en situation favorable et sécurisée', duree: '1h' },
    { sequence: 'Progresser vers le but', seanceNumber: 11, objectif: 'Pratique de matchs centrés sur la fluidité et l’esprit d’équipe', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Bilan final : Coopération, Progrès et Fair-play', duree: '1h' },
  ],
  "1ère année bac": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Evaluer l’efficacité tactique et le respect des rôles sociaux', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Systèmes de défense et importance de la solidarité collective', duree: '1h' },
    { sequence: 'Fluidité offensive', seanceNumber: 3, objectif: 'Enchaîner les actions rapides pour déstabiliser la défense adverse', duree: '1h' },
    { sequence: 'Fluidité offensive', seanceNumber: 4, objectif: 'Créer des surnombres par des courses croisées et du soutien', duree: '1h' },
    { sequence: 'Fluidité offensive', seanceNumber: 5, objectif: 'Changer de rythme collectivement pour surprendre l’adversaire', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Co-évaluer la fluidité et l’entraide au sein de l’équipe', duree: '1h' },
    { sequence: 'Défense solidaire', seanceNumber: 7, objectif: 'S’organiser en bloc pour fermer les espaces et récupérer la balle', duree: '1h' },
    { sequence: 'Défense solidaire', seanceNumber: 8, objectif: 'Communiquer pour gérer les changements de marquage', duree: '1h' },
    { sequence: 'Défense solidaire', seanceNumber: 9, objectif: 'Anticiper les passes adverses pour intercepter proprement', duree: '1h' },
    { sequence: 'Défense solidaire', seanceNumber: 10, objectif: 'Exploiter les récupérations de balle par des contre-attaques rapides', duree: '1h' },
    { sequence: 'Défense solidaire', seanceNumber: 11, objectif: 'Matchs de préparation favorisant le leadership positif', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Performance collective et respect de l’éthique sportive', duree: '1h' },
  ],
  "2ème année bac": [
    { sequence: 'Evaluation diagnostique', seanceNumber: 1, objectif: 'Analyse de l’organisation collective et du leadership responsable', duree: '1h' },
    { sequence: 'Séance théorique', seanceNumber: 2, objectif: 'Stratégies avancées et gestion éthique de la compétition', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 3, objectif: 'Maintenir l’équilibre du bloc équipe par un placement autonome', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 4, objectif: 'Adapter sa stratégie en fonction des forces de l’adversaire', duree: '1h' },
    { sequence: 'Maîtrise stratégique', seanceNumber: 5, objectif: 'Favoriser l’autonomie des joueurs dans la gestion du match', duree: '1h' },
    { sequence: 'Evaluation formative', seanceNumber: 6, objectif: 'Analyser son propre impact sur la dynamique et l’ambiance d’équipe', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 7, objectif: 'Encadrer et conseiller ses partenaires pour élever le niveau collectif', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 8, objectif: 'Gérer l’intensité du jeu tout en préservant l’intégrité des joueurs', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 9, objectif: 'Utiliser les temps morts pour réorganiser la tactique avec sérénité', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 10, objectif: 'Rechercher l’excellence technique au service d’un jeu fluide', duree: '1h' },
    { sequence: 'Expertise et Responsabilité', seanceNumber: 11, objectif: 'Finalisation du projet de jeu pour le tournoi de fin de cycle', duree: '1h' },
    { sequence: 'Evaluation sommative', seanceNumber: 12, objectif: 'Bilan final : Leadership, Stratégie et Engagement Citoyen', duree: '1h' },
  ]
};

export const BASKETBALL_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const FOOTBALL_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const RUGBY_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const ATHLETISME_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const GYMNASTIQUE_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const STRATEGIE_SESSIONS_BY_LEVEL = HANDBALL_SESSIONS_BY_LEVEL;
export const RACKET_SESSIONS_BY_LEVEL = VOLLEYBALL_SESSIONS_BY_LEVEL;
