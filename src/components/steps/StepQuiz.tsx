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
    question: "Mikä on tärkeintä joulussa?",
    options: [
      { emoji: "🎁", text: "Lahjat", points: 1 },
      { emoji: "🍲", text: "Ruoka", points: 2 },
      { emoji: "❤️", text: "Yhdessäolo", points: 3 },
      { emoji: "🌟", text: "Tunnelma", points: 2 },
    ],
  },
  {
    id: 2,
    question: "Millainen tonttu olisit työpaikalla?",
    options: [
      { emoji: "🔧", text: "Keksijä-tonttu", points: 3 },
      { emoji: "📋", text: "Järjestelijä-tonttu", points: 2 },
      { emoji: "🤝", text: "Tiimi-tonttu", points: 3 },
      { emoji: "🎨", text: "Luova tonttu", points: 2 },
    ],
  },
  {
    id: 3,
    question: "Kuinka varhain aloitat jouluostokset?",
    options: [
      { emoji: "📅", text: "Marraskuussa", points: 3 },
      { emoji: "🎄", text: "Joulukuun alussa", points: 2 },
      { emoji: "😅", text: "Viime tipassa", points: 1 },
      { emoji: "🎁", text: "Ympäri vuoden", points: 3 },
    ],
  },
  {
    id: 4,
    question: "Mikä on lempijouluherkkusi?",
    options: [
      { emoji: "🍪", text: "Piparkakut", points: 2 },
      { emoji: "⭐", text: "Joulutortut", points: 2 },
      { emoji: "🍫", text: "Suklaa", points: 1 },
      { emoji: "🥛", text: "Glögi", points: 3 },
    ],
  },
  {
    id: 5,
    question: "Miten vietät jouluaattoa?",
    options: [
      { emoji: "👨‍👩‍👧‍👦", text: "Perheen kanssa", points: 3 },
      { emoji: "🎉", text: "Ystävien kanssa", points: 2 },
      { emoji: "😌", text: "Rauhassa kotona", points: 2 },
      { emoji: "✈️", text: "Matkustaen", points: 1 },
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
