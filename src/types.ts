export type HeaderInfo = {
  teacher: string;
  niveauScolaire: string;
  moduleEnseignement: string;
  familleAPS: string;
  apsSupport: string;
  classe: string;
};

export type Session = {
  id: string;
  sequence: string;
  seanceNumber: number;
  objectif: string;
  date: string;
  heure: string;
  duree: string;
  bilan: string;
  completed: boolean;
};
