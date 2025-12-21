import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, itemName }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('payment'); // payment, processing, success

    const handlePayment = async () => {
        setLoading(true);
        setStep('processing');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setLoading(false);
        setStep('success');

        // Wait a moment before closing/callback
        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {step === 'success' ? 'Payment Successful!' : 'Complete Booking'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-4">
                    {step === 'payment' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Booking for:</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{itemName}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total Amount:</span>
                                    <span className="text-blue-600">${amount}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700">Payment Method (Mock)</p>
                                <div className="border hover:border-blue-500 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all bg-gray-50 hover:bg-white">
                                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">**** **** **** 4242</p>
                                        <p className="text-xs text-gray-500">Expires 12/26</p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                Pay ${amount}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <Lock className="w-3 h-3" />
                                Secured by Mock Payment
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-10 text-center space-y-4">
                            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
                            <h3 className="text-lg font-semibold text-gray-800">Processing Payment...</h3>
                            <p className="text-gray-500 text-sm">Please do not close this window.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-10 text-center space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Booking Confirmed!</h3>
                            <p className="text-gray-500 text-sm">Redirecting to your request status...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
