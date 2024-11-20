export interface IIncomingOption {
  text: string;
}

export interface IIncomingQuestion {
  type: 'mcq' | 'checkbox' | 'text' | 'rating';
  question: string;
  options: string[];
}

export interface IIncomingPage {
  questions: IIncomingQuestion[];
}

export interface IIncomingSurveyData {
  surveyId: string;
  pages: IIncomingPage[];
  price: number;
}
