import { Loader } from '@/components/ui/loader'

const LoadingPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Loader />
    </div>
  )
}

export default LoadingPage
