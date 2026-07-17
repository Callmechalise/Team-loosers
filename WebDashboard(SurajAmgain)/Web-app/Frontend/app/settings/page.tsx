'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {Settings, User, Bell, Shield, Palette, Globe, Watch, Users, Save, Sun, Moon, Mail, Phone, Stethoscope} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-components';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CARETAKER_PROFILE, CARETAKERS } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'emergency', label: 'Emergency Contacts', icon: Shield },
  { key: 'appearance', label: 'Theme & Language', icon: Palette },
  { key: 'iot', label: 'IoT Integration', icon: Watch },
  { key: 'users', label: 'User Management', icon: Users },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifPrefs, setNotifPrefs] = useState({
    fallAlerts: true,
    heartRateAlerts: true,
    medicationReminders: true,
    deviceOffline: true,
    lowBattery: true,
    leftBed: false,
    emailNotifications: true,
    smsAlerts: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences, and system configuration"
        icon={Settings}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    activeTab === tab.key 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:bg-blue-500 dark:shadow-blue-500/30' 
                      : 'text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Caretaker Profile</h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-blue-100 dark:border-blue-900/30">
                    <AvatarImage src={CARETAKER_PROFILE.photo} alt={CARETAKER_PROFILE.name} />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{CARETAKER_PROFILE.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{CARETAKER_PROFILE.role}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.success('Photo upload', { description: 'Choose a new profile photo' })}>
                      Change Photo
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</Label>
                    <Input defaultValue={CARETAKER_PROFILE.name} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</Label>
                    <Input defaultValue={CARETAKER_PROFILE.role} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                    <Input defaultValue={CARETAKER_PROFILE.email} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                    <Input defaultValue={CARETAKER_PROFILE.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Shift</Label>
                    <Input defaultValue={CARETAKER_PROFILE.shift} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Residents Assigned</Label>
                    <Input defaultValue={String(CARETAKER_PROFILE.residentsAssigned)} className="mt-1" readOnly />
                  </div>
                </div>
                <Button onClick={() => toast.success('Profile saved', { description: 'Your changes have been saved' })}>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose which alerts you want to receive.</p>
                <div className="space-y-3">
                  {[
                    { key: 'fallAlerts', label: 'Fall Detection Alerts', desc: 'Immediate notification when a fall is detected' },
                    { key: 'heartRateAlerts', label: 'Heart Rate Alerts', desc: 'Abnormal heart rate readings' },
                    { key: 'medicationReminders', label: 'Medication Reminders', desc: 'Scheduled medication times' },
                    { key: 'deviceOffline', label: 'Device Offline', desc: 'When a device loses connection' },
                    { key: 'lowBattery', label: 'Low Battery Warnings', desc: 'Device battery below 20%' },
                    { key: 'leftBed', label: 'Bed Exit Alerts', desc: 'When a resident leaves their bed' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                        onCheckedChange={(v) => setNotifPrefs((prev) => ({ ...prev, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Delivery Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Email Notifications</span>
                      </div>
                      <Switch checked={notifPrefs.emailNotifications} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, emailNotifications: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">SMS Alerts</span>
                      </div>
                      <Switch checked={notifPrefs.smsAlerts} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, smsAlerts: v }))} />
                    </div>
                  </div>
                </div>
                <Button onClick={() => toast.success('Preferences saved')}>
                  <Save className="h-4 w-4 mr-1" /> Save Preferences
                </Button>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Emergency Contacts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Key contacts for emergency response coordination.</p>
                <div className="space-y-2">
                  {CARETAKERS.map((ct) => (
                    <div key={ct.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ct.photo} alt={ct.name} />
                        <AvatarFallback>{ct.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{ct.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ct.role} · {ct.shift}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => toast.success(`Calling ${ct.name}`, { description: ct.phone })}>
                          <Phone className="h-3.5 w-3.5" /> Call
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.success(`Emailing ${ct.name}`, { description: ct.email })}>
                          <Mail className="h-3.5 w-3.5" /> Email
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 p-3 dark:border-gray-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Dr. Patricia Wells</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Attending Physician · +1 555-0200</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Calling Dr. Wells')}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Theme & Language</h2>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">Theme</Label>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">Choose your preferred color scheme.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 transition-all',
                        theme === 'light' 
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600/30 dark:border-blue-500 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                      )}
                    >
                      <Sun className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Light Mode</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 transition-all',
                        theme === 'dark' 
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600/30 dark:border-blue-500 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                      )}
                    >
                      <Moon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">Language</Label>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">Select your display language.</p>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeTab === 'iot' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">IoT Integration Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure wearable device connectivity and data streaming.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Auto-sync Device Data', desc: 'Continuously stream vitals from connected devices', defaultOn: true },
                    { label: 'Real-time Fall Detection', desc: 'AI-powered accelerometer-based fall detection', defaultOn: true },
                    { label: 'Indoor Positioning', desc: 'Track resident location within facility', defaultOn: true },
                    { label: 'Predictive Health Alerts', desc: 'Machine learning-based anomaly detection', defaultOn: false },
                    { label: 'Data Backup to Cloud', desc: 'Automatically backup health data every 6 hours', defaultOn: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.defaultOn} />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data Refresh Interval</Label>
                    <Select defaultValue="3">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 second</SelectItem>
                        <SelectItem value="3">Every 3 seconds</SelectItem>
                        <SelectItem value="5">Every 5 seconds</SelectItem>
                        <SelectItem value="10">Every 10 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Alert Sensitivity</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low — Fewer alerts</SelectItem>
                        <SelectItem value="medium">Medium — Balanced</SelectItem>
                        <SelectItem value="high">High — More sensitive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => toast.success('IoT settings saved')}>
                  <Save className="h-4 w-4 mr-1" /> Save Configuration
                </Button>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h2>
                  <Button size="sm" onClick={() => toast.success('Add user', { description: 'New user invitation sent' })}>
                    <Users className="h-4 w-4 mr-1" /> Add User
                  </Button>
                </div>
                <div className="space-y-2">
                  {CARETAKERS.map((ct) => (
                    <div key={ct.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ct.photo} alt={ct.name} />
                        <AvatarFallback>{ct.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{ct.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ct.email}</p>
                      </div>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        ct.role.includes('Head') 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : ct.role.includes('Senior') 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      )}>
                        {ct.role}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => toast.success('Editing permissions', { description: ct.name })}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Role Permissions</h3>
                  <div className="mt-3 space-y-2 text-xs">
                    {[
                      { role: 'Administrator', perms: 'Full access — all features, settings, and user management' },
                      { role: 'Head Nurse', perms: 'Monitor, acknowledge alerts, manage residents, view reports' },
                      { role: 'Senior Caretaker', perms: 'Monitor, acknowledge alerts, update resident info' },
                      { role: 'Registered Nurse', perms: 'Monitor, acknowledge alerts, view resident details' },
                    ].map((r) => (
                      <div key={r.role} className="flex items-start gap-2 border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700">
                        <span className="w-32 shrink-0 font-semibold text-gray-900 dark:text-white">{r.role}</span>
                        <span className="text-gray-500 dark:text-gray-400">{r.perms}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}