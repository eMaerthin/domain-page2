import type { Quiz } from "../features/quiz/quizStore";

export const quizSeed: Quiz[] = [
  {
    id: "quiz_flags_visual_1",
    type: "knowledge",
    title: "Rozpoznasz flagi świata?",
    tags: ["geografia", "flagi"],
    data: {
      questions: [
        { id: "q1", image: "/assets/flags/france.svg", answers: [{ id: "a", text: "Francja", correct: true }, { id: "b", text: "Włochy", correct: false }, { id: "c", text: "Holandia", correct: false }] },
        { id: "q2", image: "/assets/flags/japan.svg", answers: [{ id: "a", text: "Chiny", correct: false }, { id: "b", text: "Japonia", correct: true }, { id: "c", text: "Korea", correct: false }] },
        { id: "q3", image: "/assets/flags/germany.svg", answers: [{ id: "a", text: "Belgia", correct: false }, { id: "b", text: "Niemcy", correct: true }, { id: "c", text: "Austria", correct: false }] },
        { id: "q4", image: "/assets/flags/italy.svg", answers: [{ id: "a", text: "Włochy", correct: true }, { id: "b", text: "Francja", correct: false }, { id: "c", text: "Hiszpania", correct: false }] },
        { id: "q5", image: "/assets/flags/brazil.svg", answers: [{ id: "a", text: "Argentyna", correct: false }, { id: "b", text: "Brazylia", correct: true }, { id: "c", text: "Kolumbia", correct: false }] },
        { id: "q6", image: "/assets/flags/canada.svg", answers: [{ id: "a", text: "Kanada", correct: true }, { id: "b", text: "USA", correct: false }, { id: "c", text: "Austria", correct: false }] },
        { id: "q7", image: "/assets/flags/sweden.svg", answers: [{ id: "a", text: "Norwegia", correct: false }, { id: "b", text: "Szwecja", correct: true }, { id: "c", text: "Finlandia", correct: false }] },
        { id: "q8", image: "/assets/flags/uk.svg", answers: [{ id: "a", text: "Wielka Brytania", correct: true }, { id: "b", text: "Irlandia", correct: false }, { id: "c", text: "Australia", correct: false }] },
        { id: "q9", image: "/assets/flags/spain.svg", answers: [{ id: "a", text: "Hiszpania", correct: true }, { id: "b", text: "Portugalia", correct: false }, { id: "c", text: "Meksyk", correct: false }] },
        { id: "q10", image: "/assets/flags/usa.svg", answers: [{ id: "a", text: "USA", correct: true }, { id: "b", text: "Kanada", correct: false }, { id: "c", text: "Wielka Brytania", correct: false }] },
      ],
    },
  },
  {
    id: "quiz_cities_visual_1",
    type: "knowledge",
    title: "Jakie to miasto",
    tags: ["geografia", "miasta"],
    data: {
      questions: [
        { id: "q1", image: "/assets/3-guess-cities/london.jpg", answers: [{ id: "a", text: "Londyn", correct: true }, { id: "b", text: "Paryż", correct: false }, { id: "c", text: "Berlin", correct: false }] },
        { id: "q2", image: "/assets/3-guess-cities/paris.jpg", answers: [{ id: "a", text: "Marsylia", correct: false }, { id: "b", text: "Paryż", correct: true }, { id: "c", text: "Lyon", correct: false }] },
        { id: "q3", image: "/assets/3-guess-cities/berlin.jpg", answers: [{ id: "a", text: "Monachium", correct: false }, { id: "b", text: "Hamburg", correct: false }, { id: "c", text: "Berlin", correct: true }] },
        { id: "q4", image: "/assets/3-guess-cities/rome.jpg", answers: [{ id: "a", text: "Rzym", correct: true }, { id: "b", text: "Mediolan", correct: false }, { id: "c", text: "Neapol", correct: false }] },
        { id: "q5", image: "/assets/3-guess-cities/madrid.jpg", answers: [{ id: "a", text: "Madryt", correct: true }, { id: "b", text: "Barcelona", correct: false }, { id: "c", text: "Walencja", correct: false }] },
        { id: "q6", image: "/assets/3-guess-cities/toronto.jpg", answers: [{ id: "a", text: "Toronto", correct: true }, { id: "b", text: "Montreal", correct: false }, { id: "c", text: "Vancouver", correct: false }] },
        { id: "q7", image: "/assets/3-guess-cities/washington.jpg", answers: [{ id: "a", text: "Nowy Jork", correct: false }, { id: "b", text: "Los Angeles", correct: false }, { id: "c", text: "Waszyngton", correct: true }] },
        { id: "q8", image: "/assets/3-guess-cities/saopaulo.jpg", answers: [{ id: "a", text: "Rio de Janeiro", correct: false }, { id: "b", text: "São Paulo", correct: true }, { id: "c", text: "Brasília", correct: false }] },
        { id: "q9", image: "/assets/3-guess-cities/tokyo.jpg", answers: [{ id: "a", text: "Kioto", correct: false }, { id: "b", text: "Osaka", correct: false }, { id: "c", text: "Tokio", correct: true }] },
        { id: "q10", image: "/assets/3-guess-cities/stockholm.jpg", answers: [{ id: "a", text: "Malmö", correct: false }, { id: "b", text: "Sztokholm", correct: true }, { id: "c", text: "Göteborg", correct: false }] },
      ],
    },
  },
  {
    id: "quiz_animal_personality",
    type: "personality",
    title: "Jakim jesteś zwierzęciem?",
    tags: ["zabawa", "osobowość"],
    data: {
      questions: [
        { id: "q1", image: "/assets/personality/weekend.jpg", prompt: "Weekend to:", answers: [{ id: "a", text: "Impreza", traits: ["lion"] }, { id: "b", text: "Netflix", traits: ["cat"] }, { id: "c", text: "Sport", traits: ["wolf"] }] },
        { id: "q2", image: "/assets/personality/morning.jpg", prompt: "Rano najczęściej:", answers: [{ id: "a", text: "Wstaję wcześnie", traits: ["wolf"] }, { id: "b", text: "Śpię długo", traits: ["cat"] }, { id: "c", text: "Losowo", traits: ["lion"] }] },
        { id: "q3", image: "/assets/personality/friends.jpg", prompt: "W paczce znajomych:", answers: [{ id: "a", text: "Lideruję", traits: ["lion"] }, { id: "b", text: "Obserwuję", traits: ["cat"] }, { id: "c", text: "Chronię ekipę", traits: ["wolf"] }] },
        { id: "q4", image: "/assets/personality/music.jpg", prompt: "Muzyka ma być:", answers: [{ id: "a", text: "Energetyczna", traits: ["lion"] }, { id: "b", text: "Chill", traits: ["cat"] }, { id: "c", text: "Mocna", traits: ["wolf"] }] },
        { id: "q5", image: "/assets/personality/travel.jpg", prompt: "Wyjazd idealny to:", answers: [{ id: "a", text: "Plan + kontrola", traits: ["wolf"] }, { id: "b", text: "Spontan", traits: ["lion"] }, { id: "c", text: "Komfort", traits: ["cat"] }] },
        { id: "q6", image: "/assets/personality/work.jpg", prompt: "W pracy:", answers: [{ id: "a", text: "Dowiozę temat", traits: ["wolf"] }, { id: "b", text: "Błyszczę", traits: ["lion"] }, { id: "c", text: "Na luzie", traits: ["cat"] }] },
        { id: "q7", image: "/assets/personality/home.jpg", prompt: "Dom to:", answers: [{ id: "a", text: "Porządek", traits: ["wolf"] }, { id: "b", text: "Styl", traits: ["lion"] }, { id: "c", text: "Koc + cisza", traits: ["cat"] }] },
        { id: "q8", image: "/assets/personality/food.jpg", prompt: "Jedzenie ma być:", answers: [{ id: "a", text: "Mocno i konkretnie", traits: ["wolf"] }, { id: "b", text: "Eksperyment", traits: ["lion"] }, { id: "c", text: "Coś wygodnego", traits: ["cat"] }] },
      ],
      results: [
        { id: "lion", title: "Lew 🦁", description: "Masz w sobie energię lidera i lubisz być zauważany.", image: "/assets/results/lion.jpg", matchTraits: ["lion"] },
        { id: "cat", title: "Kot 🐱", description: "Cenisz spokój, wygodę i własne tempo.", image: "/assets/results/cat.jpg", matchTraits: ["cat"] },
        { id: "wolf", title: "Wilk 🐺", description: "Działasz konkretnie, niezależnie i bez zbędnego hałasu.", image: "/assets/results/wolf.jpg", matchTraits: ["wolf"] },
      ],
    },
  },
];
