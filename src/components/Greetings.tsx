const Greetings = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let greetings = 'Good Night';

  if (currentHour < 12) {
    greetings = 'Good Morning';
  } else if (currentHour < 18) {
    greetings = 'Good Afternoon';
  }

  return <h1 className='text-secondary text-3xl font-bold'>{greetings}</h1>;
};

export default Greetings;
