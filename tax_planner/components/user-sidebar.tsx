'use client'

import { X, User, MapPin, Calendar, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { UserProfile } from '@/lib/tax-calculations'

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onProfileChange: (profile: UserProfile) => void
}

export function UserSidebar({ isOpen, onClose, profile, onProfileChange }: UserSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm transform bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Personal Details</h2>
                <p className="text-xs text-muted-foreground">Configure your profile</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                  className="bg-secondary/50"
                />
              </div>
              
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => onProfileChange({ ...profile, age: parseInt(e.target.value) || 25 })}
                  placeholder="Enter your age"
                  className="bg-secondary/50"
                  min={18}
                  max={100}
                />
              </div>
              
              {/* City Type */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  City Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onProfileChange({ ...profile, cityType: 'metro' })}
                    className={`rounded-lg border p-3 text-center text-sm transition-all ${
                      profile.cityType === 'metro'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <div className="font-medium">Metro</div>
                    <div className="mt-1 text-xs opacity-70">50% HRA exemption</div>
                  </button>
                  <button
                    onClick={() => onProfileChange({ ...profile, cityType: 'non-metro' })}
                    className={`rounded-lg border p-3 text-center text-sm transition-all ${
                      profile.cityType === 'non-metro'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <div className="font-medium">Non-Metro</div>
                    <div className="mt-1 text-xs opacity-70">40% HRA exemption</div>
                  </button>
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-border pt-4">
                <h3 className="mb-4 text-sm font-medium text-foreground">A/B Test Settings</h3>
                
                {/* Advisor Mode */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Advisor Mode
                  </Label>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {profile.advisorMode === 'conservative' ? 'Conservative' : 'Growth'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {profile.advisorMode === 'conservative' 
                          ? 'Suggests PPF and safe instruments' 
                          : 'Suggests ELSS and market-linked funds'}
                      </div>
                    </div>
                    <Switch
                      checked={profile.advisorMode === 'growth'}
                      onCheckedChange={(checked) => 
                        onProfileChange({ ...profile, advisorMode: checked ? 'growth' : 'conservative' })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-border p-4">
            <p className="text-center text-xs text-muted-foreground">
              Your data is stored locally and never shared.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
