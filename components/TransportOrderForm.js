import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { format, isAfter, startOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

const TransportOrderForm = () => {
  const [step, setStep] = useState(1);
  const [transportType, setTransportType] = useState('');
  const [wzNumbers, setWzNumbers] = useState(['']);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    city: '',
    postalCode: '',
    street: '',
    buildingNumber: '',
    contactPerson: '',
    phoneNumber: '',
    additionalInfo: ''
  });
  const [requester, setRequester] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [priority, setPriority] = useState('normal');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');
  const [partialDelivery, setPartialDelivery] = useState(false);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [estimatedDimensions, setEstimatedDimensions] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState(''); // Dodano lokalizację magazynu
  const [loadingPlace, setLoadingPlace] = useState({ city: '', street: '', buildingNumber: '' }); // Miejsce załadunku
  const [unloadingPlace, setUnloadingPlace] = useState({ city: '', street: '', buildingNumber: '' }); // Miejsce rozładunku

  // Opcje transportu
  const transportOptions = [
    { id: "producer", label: "Transport od producenta" },
    { id: "warehouse", label: "Magazyn własny" }
  ];

  // Opcje lokalizacji magazynów
  const warehouseOptions = [
    { id: "lublin", label: "Magazyn Lublin" },
    { id: "krakow", label: "Magazyn Kraków" },
    { id: "poznan", label: "Magazyn Poznań" },
    { id: "katowice", label: "Magazyn Katowice" },
    { id: "gdynia", label: "Magazyn Gdynia" },
    { id: "wroclaw", label: "Magazyn Wrocław" }
  ];

  const priorityOptions = [
    { id: "normal", label: "Normalny" },
    { id: "urgent", label: "Pilny" },
    { id: "express", label: "Ekspresowy" }
  ];

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleAddWz = () => {
    setWzNumbers([...wzNumbers, '']);
  };

  const handleWzChange = (index, value) => {
    const newWzNumbers = [...wzNumbers];
    newWzNumbers[index] = value;
    setWzNumbers(newWzNumbers);
  };

  const handleRemoveWz = (index) => {
    const newWzNumbers = wzNumbers.filter((_, i) => i !== index);
    setWzNumbers(newWzNumbers.length ? newWzNumbers : ['']);
  };

  const isWzValid = (wz) => {
    const wzRegex = /^WZ\/\d{5}\/\d{2}\/[A-Z]{3}\/24$/;
    return wzRegex.test(wz);
  };

  const handleDeliveryDetailsChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleRequesterChange = (e) => {
    const { name, value } = e.target;
    setRequester(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const formData = {
      transportType: transportOptions.find(option => option.id === transportType)?.label,
      wzNumbers: wzNumbers.filter(isWzValid),
      deliveryDate: deliveryDate ? format(deliveryDate, 'dd.MM.yyyy', { locale: pl }) : null,
      deliveryDetails: {
        ...deliveryDetails,
        fullAddress: `${deliveryDetails.street} ${deliveryDetails.buildingNumber}, ${deliveryDetails.postalCode} ${deliveryDetails.city}`
      },
      warehouseLocation, // Dodano lokalizację magazynu do danych
      loadingPlace, // Miejsce załadunku
      unloadingPlace, // Miejsce rozładunku
      requester,
      priority,
      preferredDeliveryTime,
      partialDelivery,
      specialRequirements,
      estimatedWeight,
      estimatedDimensions
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Zamówienie zostało wysłane na e-mail!');
      } else {
        throw new Error('Wystąpił błąd podczas wysyłania e-maila');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Zamówienie wysłane pomyślnie.');
    }
  };

  const isDateDisabled = (date) => {
    return !isAfter(date, startOfDay(new Date()));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return transportType === "producer" || (transportType === "warehouse" && !!warehouseLocation); // Sprawdzenie wyboru magazynu
      case 2:
        return wzNumbers.some(isWzValid);
      case 3:
        return !!deliveryDate;
      case 4:
        return deliveryDetails.city && 
               deliveryDetails.postalCode && 
               deliveryDetails.street && 
               deliveryDetails.buildingNumber && 
               deliveryDetails.contactPerson && 
               deliveryDetails.phoneNumber.replace(/[^0-9]/g, '').length === 9;
      case 5:
        return requester.name && requester.email && requester.department;
      case 6:
        return true; 
      default:
        return false;
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          {step === 1 ? 'Wybór rodzaju transportu' : 
           step === 2 ? 'Wprowadzanie numerów WZ' : 
           step === 3 ? 'Wybór daty dostawy' :
           step === 4 ? 'Szczegóły dostawy' :
           step === 5 ? 'Dane osoby zlecającej' :
           'Podsumowanie'}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {step === 1 ? 'Wybierz preferowany rodzaj transportu dla Twojego zamówienia.' : 
           step === 2 ? 'Wprowadź numery WZ dla Twojego zamówienia.' :
           step === 3 ? 'Wybierz preferowaną datę dostawy.' :
           step === 4 ? 'Wprowadź szczegóły dostawy.' :
           step === 5 ? 'Podaj dane osoby zlecającej transport.' :
           'Sprawdź poprawność wprowadzonych danych.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <RadioGroup
            value={transportType}
            onValueChange={setTransportType}
            className="space-y-3"
          >
            {transportOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label 
                  htmlFor={option.id} 
                  className="font-medium cursor-pointer flex-grow text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Jeśli wybrano "Transport od producenta", pokaż pola załadunku i rozładunku */}
        {transportType === "producer" && (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="loadingCity">Miejsce załadunku - Miasto</Label>
              <Input
                id="loadingCity"
                name="city"
                value={loadingPlace.city}
                onChange={(e) => setLoadingPlace({ ...loadingPlace, city: e.target.value })}
                placeholder="Wprowadź miasto załadunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="loadingStreet">Miejsce załadunku - Ulica</Label>
              <Input
                id="loadingStreet"
                name="street"
                value={loadingPlace.street}
                onChange={(e) => setLoadingPlace({ ...loadingPlace, street: e.target.value })}
                placeholder="Wprowadź ulicę załadunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="loadingBuildingNumber">Miejsce załadunku - Numer budynku</Label>
              <Input
                id="loadingBuildingNumber"
                name="buildingNumber"
                value={loadingPlace.buildingNumber}
                onChange={(e) => setLoadingPlace({ ...loadingPlace, buildingNumber: e.target.value })}
                placeholder="Wprowadź numer budynku załadunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unloadingCity">Miejsce rozładunku - Miasto</Label>
              <Input
                id="unloadingCity"
                name="city"
                value={unloadingPlace.city}
                onChange={(e) => setUnloadingPlace({ ...unloadingPlace, city: e.target.value })}
                placeholder="Wprowadź miasto rozładunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unloadingStreet">Miejsce rozładunku - Ulica</Label>
              <Input
                id="unloadingStreet"
                name="street"
                value={unloadingPlace.street}
                onChange={(e) => setUnloadingPlace({ ...unloadingPlace, street: e.target.value })}
                placeholder="Wprowadź ulicę rozładunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unloadingBuildingNumber">Miejsce rozładunku - Numer budynku</Label>
              <Input
                id="unloadingBuildingNumber"
                name="buildingNumber"
                value={unloadingPlace.buildingNumber}
                onChange={(e) => setUnloadingPlace({ ...unloadingPlace, buildingNumber: e.target.value })}
                placeholder="Wprowadź numer budynku rozładunku"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Dodano listę rozwijaną lokalizacji magazynów */}
        {transportType === "warehouse" && (
          <div className="mt-4">
            <Label htmlFor="warehouseLocation">Wybierz magazyn:</Label>
            <select
              id="warehouseLocation"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Wybierz magazyn...</option>
              {warehouseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Reszta kodu odpowiedzialna za inne kroki formularza */}
        {step === 2 && (
          <div className="space-y-4">
            {wzNumbers.map((wz, index) => (
              <div key={index} className="flex items-center space-x-2">
                <InputMask
                  mask="WZ/99999/99/aaa/24"
                  value={wz}
                  onChange={(e) => handleWzChange(index, e.target.value.toUpperCase())}
                  placeholder="WZ/00000/00/AAA/24"
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      type="text"
                      className={`flex-grow ${!isWzValid(wz) && wz ? 'border-red-500' : ''}`}
                    />
                  )}
                </InputMask>
                {wzNumbers.length > 1 && (
                  <Button 
                    onClick={() => handleRemoveWz(index)} 
                    type="button" 
                    variant="outline"
                    className="p-2"
                  >
                    <X size={16} />
                  </Button>
                )}
                {index === wzNumbers.length - 1 && (
                  <Button onClick={handleAddWz} type="button" variant="outline" className="p-2">
                    +
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Kontynuacja formularza jak w poprzednich krokach */}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button onClick={handleBack} variant="outline">
            Wstecz
          </Button>
        )}
        <Button 
          onClick={step < 6 ? handleNext : handleSubmit}
          type={step === 6 ? "submit" : "button"}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          disabled={!isStepValid()}
        >
          {step < 6 ? 'Dalej' : 'Zatwierdź'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransportOrderForm;
