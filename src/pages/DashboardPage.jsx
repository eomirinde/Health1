import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Users, Activity, Heart, Stethoscope, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: [],
    vitals: {},
    notifications: []
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setStats({
            appointments: [
              { id: 1, doctor: 'Dr. Sarah Johnson', date: '2023-12-15T10:30:00', type: 'General Checkup', status: 'upcoming' },
              { id: 2, doctor: 'Dr. Michael Chen', date: '2023-12-10T14:00:00', type: 'Dental', status: 'completed' },
            ],
            vitals: {
              heartRate: '72 bpm',
              bloodPressure: '120/80 mmHg',
              temperature: '36.6°C',
              oxygenLevel: '98%',
              lastUpdated: '2023-12-05T08:45:00'
            },
            notifications: [
              { id: 1, message: 'Your prescription is ready for pickup', date: '2023-12-06T09:15:00', read: false },
              { id: 2, message: 'Appointment reminder: Dr. Sarah Johnson tomorrow at 10:30 AM', date: '2023-12-14T15:00:00', read: false },
              { id: 3, message: 'Your lab results are now available', date: '2023-12-04T11:30:00', read: true },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-health-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('welcomeUser', { name: currentUser?.name || t('user') })}
        </h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          {t('bookAppointment')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-health-600" />
              {t('upcomingAppointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.appointments.filter(a => a.status === 'upcoming').length > 0 ? (
              <ul className="space-y-3">
                {stats.appointments
                  .filter(a => a.status === 'upcoming')
                  .map(appointment => (
                    <li key={appointment.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="font-medium">{appointment.doctor}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)} - {appointment.type}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('noUpcomingAppointments')}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              {t('viewAllAppointments')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Heart className="mr-2 h-5 w-5 text-health-600" />
              {t('healthVitals')}
            </CardTitle>
            <CardDescription>
              {t('lastUpdated')}: {formatDate(stats.vitals.lastUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('heartRate')}</div>
                <div className="font-medium text-lg">{stats.vitals.heartRate}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('bloodPressure')}</div>
                <div className="font-medium text-lg">{stats.vitals.bloodPressure}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('temperature')}</div>
                <div className="font-medium text-lg">{stats.vitals.temperature}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('oxygenLevel')}</div>
                <div className="font-medium text-lg">{stats.vitals.oxygenLevel}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              {t('updateVitals')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-health-600" />
              {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.notifications.length > 0 ? (
              <ul className="space-y-3">
                {stats.notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`p-3 rounded-md ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-health-50 dark:bg-health-900/20 border-l-4 border-health-500'}`}
                  >
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('noNotifications')}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              {t('viewAllNotifications')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="services" className="mt-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="services">
            <Stethoscope className="mr-2 h-4 w-4" />
            {t('services')}
          </TabsTrigger>
          <TabsTrigger value="doctors">
            <User className="mr-2 h-4 w-4" />
            {t('doctors')}
          </TabsTrigger>
          <TabsTrigger value="records">
            <FileText className="mr-2 h-4 w-4" />
            {t('medicalRecords')}
          </TabsTrigger>
          <TabsTrigger value="family">
            <Users className="mr-2 h-4 w-4" />
            {t('family')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="border rounded-md p-4">
          <h3 className="text-xl font-medium mb-4">{t('availableServices')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['General Checkup', 'Specialist Consultation', 'Lab Tests', 'Vaccinations', 'Telemedicine', 'Emergency Care', 'Pharmacy', 'Mental Health'].map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border rounded-md p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-health-600 mb-2">
                  {/* Icon would go here */}
                  <div className="w-12 h-12 mx-auto bg-health-100 dark:bg-health-900/30 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-health-600" />
                  </div>
                </div>
                <div className="font-medium">{t(service.toLowerCase().replace(' ', ''))}</div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="doctors" className="border rounded-md p-4">
          <h3 className="text-xl font-medium mb-4">{t('recommendedDoctors')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Dr. Sarah Johnson', specialty: 'General Practitioner', rating: 4.9 },
              { name: 'Dr. Michael Chen', specialty: 'Cardiologist', rating: 4.8 },
              { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrician', rating: 4.7 }
            ].map((doctor, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border rounded-md p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="text-sm font-medium">{doctor.rating}/5.0</span>
                  </div>
                  <Button size="sm">{t('bookNow')}</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="records" className="border rounded-md p-4">
          <h3 className="text-xl font-medium mb-4">{t('recentMedicalRecords')}</h3>
          <div className="space-y-3">
            {[
              { type: 'Lab Result', date: '2023-12-01', description: 'Complete Blood Count' },
              { type: 'Prescription', date: '2023-11-15', description: 'Amoxicillin 500mg' },
              { type: 'Medical Certificate', date: '2023-10-22', description: 'Fitness Certificate' }
            ].map((record, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border rounded-md">
                <div>
                  <div className="font-medium">{record.type}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{record.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</div>
                  <Button variant="link" size="sm" className="p-0 h-auto">{t('view')}</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="family" className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">{t('familyMembers')}</h3>
            <Button size="sm">{t('addMember')}</Button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Jane Doe', relation: 'Spouse', age: 35 },
              { name: 'Alex Doe', relation: 'Child', age: 10 }
            ].map((member, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.relation}, {member.age} {t('yearsOld')}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">{t('viewProfile')}</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;