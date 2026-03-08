interface LoaderProps {
  screen?: 'default' | 'dashboard' | 'full';
}

const Loader = ({ screen = 'default' }: LoaderProps) => {
  if (screen === 'full') {
    return (
      <div className='flex items-center justify-center w-full h-screen bg-background'>
        <div className='spinner'></div>
      </div>
    );
  }

  if (screen === 'dashboard') {
    return (
      <div className='flex items-center justify-center w-full h-[70dvh] bg-background'>
        <div className='spinner'></div>
      </div>
    );
  }

  return <div className='spinner'></div>;
};

export default Loader;
