import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { JobSeekerProfile, Skill, Experience, Education } from '@/app/types';

interface JobSeekerProfileSetupProps {
  onComplete: (profile: JobSeekerProfile) => void;
}

export function JobSeekerProfileSetup({ onComplete }: JobSeekerProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState({ name: '', level: 'intermediate' as const, years: '' });
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [preferences, setPreferences] = useState({
    preferredRoles: [] as string[],
    locations: [] as string[],
    minSalary: '',
    maxSalary: '',
  });
  const [careerGoals, setCareerGoals] = useState({ shortTerm: '', longTerm: '' });

  const addSkill = () => {
    if (currentSkill.name && currentSkill.years) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: currentSkill.name,
        level: currentSkill.level,
        yearsOfExperience: parseFloat(currentSkill.years),
        category: 'General'
      };
      setSkills([...skills, newSkill]);
      setCurrentSkill({ name: '', level: 'intermediate', years: '' });
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleComplete = () => {
    const profile: JobSeekerProfile = {
      userId: '1',
      education,
      skills,
      experience,
      careerGoals,
      preferences: {
        preferredRoles: preferences.preferredRoles,
        locations: preferences.locations,
        salaryRange: {
          min: parseInt(preferences.minSalary) || 0,
          max: parseInt(preferences.maxSalary) || 0
        },
        workType: ['Full-time', 'Remote', 'Hybrid']
      },
      learningProgress: []
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                } ${s !== 1 ? 'ml-2' : ''}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step} of 4
          </p>
        </div>

        {/* Step 1: Skills */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What are your skills?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Skill Name</Label>
                  <Input
                    placeholder="e.g., Python"
                    value={currentSkill.name}
                    onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Level</Label>
                  <Select
                    value={currentSkill.level}
                    onValueChange={(value: any) => setCurrentSkill({ ...currentSkill, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="2"
                      value={currentSkill.years}
                      onChange={(e) => setCurrentSkill({ ...currentSkill, years: e.target.value })}
                    />
                    <Button onClick={addSkill}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="text-sm py-2 px-3">
                    {skill.name} ({skill.level}) - {skill.yearsOfExperience}y
                    <button onClick={() => removeSkill(skill.id)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <Button onClick={() => setStep(2)} disabled={skills.length === 0} className="w-full mt-6">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Education & Experience */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Education & Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Highest Degree</Label>
                <Input
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  onChange={(e) => {
                    if (education.length === 0) {
                      setEducation([{
                        id: '1',
                        degree: e.target.value,
                        institution: '',
                        year: '',
                        field: 'Computer Science'
                      }]);
                    } else {
                      setEducation([{ ...education[0], degree: e.target.value }]);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Institution</Label>
                <Input
                  placeholder="e.g., MIT"
                  onChange={(e) => {
                    if (education.length === 0) {
                      setEducation([{
                        id: '1',
                        degree: '',
                        institution: e.target.value,
                        year: '',
                        field: 'Computer Science'
                      }]);
                    } else {
                      setEducation([{ ...education[0], institution: e.target.value }]);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Graduation Year</Label>
                <Input
                  placeholder="e.g., 2020"
                  onChange={(e) => {
                    if (education.length === 0) {
                      setEducation([{
                        id: '1',
                        degree: '',
                        institution: '',
                        year: e.target.value,
                        field: 'Computer Science'
                      }]);
                    } else {
                      setEducation([{ ...education[0], year: e.target.value }]);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Most Recent Job Title</Label>
                <Input
                  placeholder="e.g., Data Analyst"
                  onChange={(e) => {
                    if (experience.length === 0) {
                      setExperience([{
                        id: '1',
                        title: e.target.value,
                        company: '',
                        duration: '',
                        description: '',
                        skills: []
                      }]);
                    } else {
                      setExperience([{ ...experience[0], title: e.target.value }]);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Company</Label>
                <Input
                  placeholder="e.g., TechCorp"
                  onChange={(e) => {
                    if (experience.length === 0) {
                      setExperience([{
                        id: '1',
                        title: '',
                        company: e.target.value,
                        duration: '',
                        description: '',
                        skills: []
                      }]);
                    } else {
                      setExperience([{ ...experience[0], company: e.target.value }]);
                    }
                  }}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Career Goals */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>What are your career goals?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Short-term Goal (1-2 years)</Label>
                <Textarea
                  placeholder="e.g., Transition to a Data Scientist role at a top tech company"
                  value={careerGoals.shortTerm}
                  onChange={(e) => setCareerGoals({ ...careerGoals, shortTerm: e.target.value })}
                />
              </div>

              <div>
                <Label>Long-term Goal (5+ years)</Label>
                <Textarea
                  placeholder="e.g., Lead an AI research team and contribute to cutting-edge AI solutions"
                  value={careerGoals.longTerm}
                  onChange={(e) => setCareerGoals({ ...careerGoals, longTerm: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Roles (comma separated)</Label>
                <Input
                  placeholder="e.g., Data Scientist, Machine Learning Engineer"
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredRoles: e.target.value.split(',').map(r => r.trim())
                  })}
                />
              </div>

              <div>
                <Label>Preferred Locations (comma separated)</Label>
                <Input
                  placeholder="e.g., San Francisco, Seattle, Remote"
                  onChange={(e) => setPreferences({
                    ...preferences,
                    locations: e.target.value.split(',').map(l => l.trim())
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Salary ($)</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={preferences.minSalary}
                    onChange={(e) => setPreferences({ ...preferences, minSalary: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Maximum Salary ($)</Label>
                  <Input
                    type="number"
                    placeholder="150000"
                    value={preferences.maxSalary}
                    onChange={(e) => setPreferences({ ...preferences, maxSalary: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
