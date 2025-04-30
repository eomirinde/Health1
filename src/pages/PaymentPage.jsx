import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { processPayment, getPaymentHistory, getPaymentMethods, addPaymentMethod, deletePaymentMethod } from '@/api/payment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Trash2, Plus, Check, AlertCircle } from 'lucide-react';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [newPayment, setNewPayment] = useState({
    amount: '',
    description: '',
    selectedMethodId: '',
  });
  
  const [newMethod, setNewMethod] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [historyData, methodsData] = await Promise.all([
          getPaymentHistory(),
          getPaymentMethods(),
        ]);
        
        setPaymentHistory(historyData.payments || []);
        setPaymentMethods(methodsData.methods || []);
      } catch (error) {
        toast({
          title: t('errorFetchingPaymentData'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({
      ...newPayment,
      [name]: value,
    });
  };

  const handleMethodChange = (e) => {
    const { name, value } = e.target;
    setNewMethod({
      ...newMethod,
      [name]: value,
    });
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    
    if (!newPayment.amount || !newPayment.description || !newPayment.selectedMethodId) {
      toast({
        title: t('validationError'),
        description: t('allFieldsRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    setProcessing(true);
    try {
      const paymentData = {
        amount: parseFloat(newPayment.amount),
        description: newPayment.description,
        paymentMethodId: newPayment.selectedMethodId,
      };
      
      const result = await processPayment(paymentData);
      
      // Add the new payment to history
      setPaymentHistory([
        {
          id: result.paymentId,
          amount: paymentData.amount,
          description: paymentData.description,
          date: new Date().toISOString(),
          status: 'completed',
        },
        ...paymentHistory,
      ]);
      
      // Reset form
      setNewPayment({
        amount: '',
        description: '',
        selectedMethodId: '',
      });
      
      toast({
        title: t('paymentSuccessful'),
        description: t('paymentProcessed'),
      });
    } catch (error) {
      toast({
        title: t('paymentFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newMethod.cardholderName || !newMethod.cardNumber || !newMethod.expiryDate || !newMethod.cvv) {
      toast({
        title: t('validationError'),
        description: t('allFieldsRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    // Validate card number format (simple check)
    if (!/^\d{13,19}$/.test(newMethod.cardNumber.replace(/\s/g, ''))) {
      toast({
        title: t('validationError'),
        description: t('invalidCardNumber'),
        variant: 'destructive',
      });
      return;
    }
    
    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(newMethod.expiryDate)) {
      toast({
        title: t('validationError'),
        description: t('invalidExpiryDate'),
        variant: 'destructive',
      });
      return;
    }
    
    // Validate CVV format
    if (!/^\d{3,4}$/.test(newMethod.cvv)) {
      toast({
        title: t('validationError'),
        description: t('invalidCvv'),
        variant: 'destructive',
      });
      return;
    }
    
    setProcessing(true);
    try {
      const result = await addPaymentMethod(newMethod);
      
      // Add the new method to the list
      setPaymentMethods([
        ...paymentMethods,
        {
          id: result.id,
          cardholderName: newMethod.cardholderName,
          cardNumber: `**** **** **** ${newMethod.cardNumber.slice(-4)}`,
          expiryDate: newMethod.expiryDate,
          cardType: result.cardType || 'visa', // Default to visa if not provided
        },
      ]);
      
      // Reset form
      setNewMethod({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
      
      toast({
        title: t('paymentMethodAdded'),
        description: t('cardAddedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('addPaymentMethodFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      await deletePaymentMethod(methodId);
      
      // Remove the method from the list
      setPaymentMethods(paymentMethods.filter(method => method.id !== methodId));
      
      toast({
        title: t('paymentMethodRemoved'),
        description: t('cardRemovedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('removePaymentMethodFailed'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-health-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        {t('payments')}
      </h1>

      <Tabs defaultValue="make-payment" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="make-payment">{t('makePayment')}</TabsTrigger>
          <TabsTrigger value="payment-methods">{t('paymentMethods')}</TabsTrigger>
          <TabsTrigger value="payment-history">{t('paymentHistory')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="make-payment">
          <Card>
            <CardHeader>
              <CardTitle>{t('makePayment')}</CardTitle>
              <CardDescription>
                {t('makePaymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('amount')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={handlePaymentChange}
                      className="pl-8"
                      placeholder="0.00"
                      disabled={processing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newPayment.description}
                    onChange={handlePaymentChange}
                    placeholder={t('paymentDescription')}
                    disabled={processing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="selectedMethodId">{t('paymentMethod')}</Label>
                  {paymentMethods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            newPayment.selectedMethodId === method.id
                              ? 'border-health-500 bg-health-50 dark:bg-health-900/20'
                              : 'border-gray-200 hover:border-health-300'
                          }`}
                          onClick={() => setNewPayment({
                            ...newPayment,
                            selectedMethodId: method.id,
                          })}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-3">
                                <CreditCard className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-medium">{method.cardholderName}</div>
                                <div className="text-sm text-gray-500">{method.cardNumber}</div>
                                <div className="text-xs text-gray-400">Expires: {method.expiryDate}</div>
                              </div>
                            </div>
                            {newPayment.selectedMethodId === method.id && (
                              <Check className="h-5 w-5 text-health-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-gray-500">{t('noPaymentMethods')}</p>
                      <Button 
                        variant="link" 
                        onClick={() => document.getElementById('payment-methods-tab').click()}
                      >
                        {t('addPaymentMethod')}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={processing || !newPayment.selectedMethodId}
                  >
                    {processing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}
                      </span>
                    ) : t('makePayment')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-methods" id="payment-methods-tab">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethods')}</CardTitle>
              <CardDescription>
                {t('paymentMethodsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length > 0 && (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{method.cardholderName}</div>
                          <div className="text-sm text-gray-500">{method.cardNumber}</div>
                          <div className="text-xs text-gray-400">Expires: {method.expiryDate}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">{t('delete')}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">{t('addNewPaymentMethod')}</h3>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">{t('cardholderName')}</Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      value={newMethod.cardholderName}
                      onChange={handleMethodChange}
                      placeholder={t('enterCardholderName')}
                      disabled={processing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">{t('cardNumber')}</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={newMethod.cardNumber}
                      onChange={handleMethodChange}
                      placeholder="1234 5678 9012 3456"
                      disabled={processing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={newMethod.expiryDate}
                        onChange={handleMethodChange}
                        placeholder="MM/YY"
                        disabled={processing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">{t('cvv')}</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="password"
                        value={newMethod.cvv}
                        onChange={handleMethodChange}
                        placeholder="123"
                        maxLength={4}
                        disabled={processing}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('processing')}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          {t('addCard')}
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">{t('securePayments')}</p>
                    <p className="mt-1">{t('securePaymentsDescription')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-history">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentHistory')}</CardTitle>
              <CardDescription>
                {t('paymentHistoryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">{t('date')}</th>
                          <th className="text-left py-3 px-4">{t('description')}</th>
                          <th className="text-right py-3 px-4">{t('amount')}</th>
                          <th className="text-right py-3 px-4">{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3 px-4">{formatDate(payment.date)}</td>
                            <td className="py-3 px-4">{payment.description}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(payment.amount)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <CreditCard className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {t('noPaymentHistory')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noPaymentHistoryDescription')}
                  </p>
                  <Button
                    onClick={() => document.querySelector('[value="make-payment"]').click()}
                  >
                    {t('makeFirstPayment')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentPage;