import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Set your personal targets for study, coding, gym, and daily discipline." />
      <Card className="max-w-2xl">
        <form className="grid gap-4 md:grid-cols-2">
          <Label>Name<Input name="name" defaultValue="DevTrack User" /></Label>
          <Label>Mobile Number<Input name="mobileNumber" defaultValue="+91 9999999999" /></Label>
          <Label className="md:col-span-2">Profession<Input name="profession" defaultValue="Student Developer" /></Label>
          <Label>Daily Study Hours<Input name="dailyTargetStudyHours" type="number" defaultValue="3" /></Label>
          <Label>Daily Coding Hours<Input name="dailyTargetCodingHours" type="number" defaultValue="4" /></Label>
          <Label>Daily Gym Time<Input name="dailyTargetGymTime" type="number" defaultValue="60" /></Label>
          <div className="md:col-span-2"><Button type="button">Save Profile</Button></div>
        </form>
      </Card>
    </>
  );
}
