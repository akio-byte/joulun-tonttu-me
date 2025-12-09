import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: { emoji: string; text: string; points: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Mikä on joulussa tärkeintä?",
    options: [
      { emoji: "🎁", text: "Lahjat ja yllätykset", points: 2 },
      { emoji: "🍲", text: "Hyvä ruoka ja herkut", points: 3 },
      { emoji: "❤️", text: "Yhdessäolo läheisten kanssa", points: 5 },
      { emoji: "🌟", text: "Jouluinen tunnelma", points: 4 },
    ],
  },
  {
    id: 2,
    question: "Miten toimit ryhmässä?",
    options: [
      { emoji: "🎯", text: "Johdan ja organisoin", points: 5 },
      { emoji: "🤝", text: "Tuen muita ja kuuntelen", points: 4 },
      { emoji: "💡", text: "Keksin uusia ideoita", points: 3 },
      { emoji: "🔧", text: "Hoidan käytännön asiat", points: 3 },
    ],
  },
];

interface StepQuizProps {
  onNext: (answers: number[], score: number) => void;
  onBack: () => void;
}

export const StepQuiz = ({ onNext, onBack }: StepQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, question.options[selectedOption].points];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      const totalScore = newAnswers.reduce((sum, points) => sum + points, 0);
      onNext(newAnswers, totalScore);
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          🔮 Tonttututka
        </h2>
        <p className="text-muted-foreground font-body">
          Kysymys {currentQuestion + 1} / {questions.length}
        </p>
      </div>

      <div className="bg-christmas-cream rounded-2xl p-6 border border-muted">
        <h3 className="text-xl md:text-2xl font-display font-semibold text-card-foreground text-center mb-6">
          {question.question}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectOption(index)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02]",
                selectedOption === index
                  ? "border-christmas-gold bg-christmas-gold/10 shadow-lg"
                  : "border-muted bg-card hover:border-christmas-gold/50"
              )}
            >
              <span className="text-2xl mr-2">{option.emoji}</span>
              <span className="font-semibold text-card-foreground">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={currentQuestion === 0 ? onBack : () => setCurrentQuestion((prev) => prev - 1)}
          className="flex-1"
        >
          <ArrowLeft className="mr-2" />
          Takaisin
        </Button>
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={handleNext}
          disabled={selectedOption === null}
          className="flex-1"
        >
          {isLastQuestion ? "Siirry kuvaan" : "Seuraava"}
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
