export const situations = [
  {id: 'fomo', label: 'Беспокоит, что пропущу', icon: 'CloudSun', color: 'rose', lesson: 'l4', practice: 'fomo', title: 'Событие скоро закончится', text: 'Посмотрим, что ты точно знаешь о событии и сколько времени на него уйдёт.'},
  {id: 'duty', label: 'Игра стала обязанностью', icon: 'Gamepad2', color: 'violet', lesson: 'l2', practice: 'choice', title: 'Хочу ли я играть сейчас?', text: 'Интерес, своя цель и ожидания команды могут вести в игру по разным причинам.'},
  {id: 'rest', label: 'Хочу переключиться', icon: 'Sprout', color: 'blue', lesson: 'l8', practice: 'ground', title: 'Матч уже закончился', text: 'Можно оглядеться, сменить положение или сделать паузу. Выбери то, что подходит сейчас.'},
] as const;
