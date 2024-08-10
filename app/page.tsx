import Head from 'next/head';
import ObjectDetection from '../components/ObjectDetection';

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Object Detection</title>
        <meta name="description" content="Object detection with TensorFlow.js and TypeScript" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='bg-red-300 h-[100vh] w-full'>
        <h1>Object Detection App</h1>
        <ObjectDetection />
      </main>
    </div>
  );
};

export default Home;
