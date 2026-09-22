import { StudentMobileMenu } from '@/components/StudentMobileMenu'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <StudentMobileMenu />
    </>
  )
}
