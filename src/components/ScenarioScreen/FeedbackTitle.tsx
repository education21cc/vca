import React from 'react';

interface Props {
  correct: boolean;
  texts: {[key: string]: string};
}

const FeedbackTitle = (props: Props) => {
  if (props.correct) {
    return (
      <h1 className="correct">
        {props.texts["feedback-correct"]}
      </h1>
    );
  }
  return (
    <h1 className="wrong">
      {props.texts["feedback-wrong"]}
    </h1>
  );
}

export default FeedbackTitle;
