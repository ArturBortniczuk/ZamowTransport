import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { format, isAfter, startOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react';

const TransportOrderForm = () => {
  const [step, setStep] = useState(1);
  const [transportType, setTransportType] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loadingLocation, setLoadingLocation] = useState('');
  const [unloadingLocation, setUnloadingLocation] = useState('');
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
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [estimatedLength, setEstimatedLength] = useState(''); // Zamieniamy wymiary na długość

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
      warehouse: selectedWarehouse ? warehouseOptions.find(option => option.id === selectedWarehouse)?.label : null,
      loadingLocation: transportType === "producer" ? loadingLocation : null,
      unloadingLocation: transportType === "producer" ? unloadingLocation : null,
      wzNumbers: wzNumbers.filter(isWzValid),
      deliveryDate: deliveryDate ? format(deliveryDate, 'dd.MM.yyyy', { locale: pl }) : null,
      deliveryDetails: {
        ...deliveryDetails,
        fullAddress: `${deliveryDetails.street} ${deliveryDetails.buildingNumber}, ${deliveryDetails.postalCode} ${deliveryDetails.city}`
      },
      requester,
      preferredDeliveryTime,
      specialRequirements,
      estimatedWeight,
      estimatedLength
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
        return !!selectedWarehouse; // Magazyn musi być wybrany na pierwszym kroku
      case 2:
        return wzNumbers.some(isWzValid);
      case 3:
        return !!deliveryDate && preferredDeliveryTime.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/); // Preferowane godziny w formacie HH:MM-HH:MM
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

  const getSummary = () => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Rodzaj transportu:</h3>
          <p>{transportOptions.find(option => option.id === transportType)?.label}</p>
        </div>
        <div>
          <h3 className="font-semibold">Magazyn:</h3>
          <p>{warehouseOptions.find(option => option.id === selectedWarehouse)?.label}</p>
        </div>
        {transportType === "producer" && (
          <div>
            <h3 className="font-semibold">Miejsce załadunku:</h3>
            <p>{loadingLocation}</p>
            <h3 className="font-semibold">Miejsce rozładunku:</h3>
            <p>{unloadingLocation}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold">Numery WZ:</h3>
          <ul>
            {wzNumbers.filter(isWzValid).map((wz, index) => (
              <li key={index}>{wz}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Data dostawy:</h3>
          <p>{deliveryDate ? format(deliveryDate, 'dd.MM.yyyy', { locale: pl }) : 'Nie wybrano'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Preferowane godziny dostawy:</h3>
          <p>{preferredDeliveryTime || 'Nie określono'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Adres dostawy:</h3>
          <p>{deliveryDetails.street} {deliveryDetails.buildingNumber}</p>
          <p>{deliveryDetails.postalCode} {deliveryDetails.city}</p>
        </div>
        <div>
          <h3 className="font-semibold">Osoba kontaktowa:</h3>
          <p>{deliveryDetails.contactPerson}</p>
        </div>
        <div>
          <h3 className="font-semibold">Numer telefonu:</h3>
          <p>{deliveryDetails.phoneNumber}</p>
        </div>
        <div>
          <h3 className="font-semibold">Osoba zlecająca:</h3>
          <p>{requester.name}</p>
          <p>{requester.email}</p>
          <p>{requester.department}</p>
        </div>
        <div>
          <h3 className="font-semibold">Szacunkowa waga:</h3>
          <p>{estimatedWeight || 'Nie określono'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Szacunkowa długość ładunku:</h3>
          <p>{estimatedLength || 'Nie określono'}</p>
        </div>
        {specialRequirements && (
          <div>
            <h3 className="font-semibold">Wymagania specjalne:</h3>
            <p>{specialRequirements}</p>
          </div>
        )}
        {deliveryDetails.additionalInfo && (
          <div>
            <h3 className="font-semibold">Dodatkowe informacje:</h3>
            <p>{deliveryDetails.additionalInfo}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          {step === 1 ? 'Wybór magazynu' : 
           step === 2 ? 'Wprowadzanie numerów WZ' : 
           step === 3 ? 'Wybór daty dostawy' :
           step === 4 ? 'Szczegóły dostawy' :
           step === 5 ? 'Dane osoby zlecającej' :
           'Podsumowanie'}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {step === 1 ? 'Wybierz magazyn dla Twojego zamówienia.' : 
           step === 2 ? 'Wprowadź numery WZ dla Twojego zamówienia.' :
           step === 3 ? 'Wybierz preferowaną datę i godziny dostawy.' :
           step === 4 ? 'Wprowadź szczegóły dostawy.' :
           step === 5 ? 'Podaj dane osoby zlecającej transport.' :
           'Sprawdź poprawność wprowadzonych danych.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div>
            <Label htmlFor="warehouse">Wybierz magazyn</Label>
            <select
              id="warehouse"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Wybierz magazyn</option>
              {warehouseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {transportType === "producer" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="loadingLocation">Miejsce załadunku</Label>
              <Input
                id="loadingLocation"
                value={loadingLocation}
                onChange={(e) => setLoadingLocation(e.target.value)}
                placeholder="Wprowadź miejsce załadunku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unloadingLocation">Miejsce rozładunku</Label>
              <Input
                id="unloadingLocation"
                value={unloadingLocation}
                onChange={(e) => setUnloadingLocation(e.target.value)}
                placeholder="Wprowadź miejsce rozładunku"
                className="mt-1"
              />
            </div>
          </div>
        )}
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
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                className="rounded-md border"
                locale={pl}
                disabled={isDateDisabled}
                initialFocus
              />
            </div>
            <div>
              <Label htmlFor="preferredDeliveryTime">Preferowane godziny dostawy (format: HH:MM-HH:MM)</Label>
              <Input
                id="preferredDeliveryTime"
                value={preferredDeliveryTime}
                onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                placeholder="np. 10:00-14:00"
                className="mt-1"
              />
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                name="city"
                value={deliveryDetails.city}
                onChange={handleDeliveryDetailsChange}
                placeholder="Wprowadź miasto"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Kod pocztowy</Label>
              <InputMask
                mask="99-999"
                value={deliveryDetails.postalCode}
                onChange={handleDeliveryDetailsChange}
              >
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    id="postalCode"
                    name="postalCode"
                    placeholder="00-000"
                    className="mt-1"
                  />
                )}
              </InputMask>
            </div>
            <div>
              <Label htmlFor="street">Ulica</Label>
              <Input
                id="street"
                name="street"
                value={deliveryDetails.street}
                onChange={handleDeliveryDetailsChange}
                placeholder="Wprowadź ulicę"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="buildingNumber">Numer budynku</Label>
              <Input
                id="buildingNumber"
                name="buildingNumber"
                value={deliveryDetails.buildingNumber}
                onChange={handleDeliveryDetailsChange}
                placeholder="Wprowadź numer budynku"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Osoba kontaktowa</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={deliveryDetails.contactPerson}
                onChange={handleDeliveryDetailsChange}
                placeholder="Imię i nazwisko"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Numer telefonu</Label>
              <InputMask
                mask="999-999-999"
                value={deliveryDetails.phoneNumber}
                onChange={handleDeliveryDetailsChange}
              >
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="000-000-000"
                    className="mt-1"
                  />
                )}
              </InputMask>
            </div>
            <div>
              <Label htmlFor="additionalInfo">Dodatkowe informacje</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={deliveryDetails.additionalInfo}
                onChange={handleDeliveryDetailsChange}
                placeholder="Dodatkowe informacje (opcjonalnie)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="estimatedWeight">Szacunkowa waga (kg)</Label>
              <Input
                id="estimatedWeight"
                type="number"
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
                placeholder="np. 100"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="estimatedLength">Szacunkowa długość ładunku (cm)</Label>
              <Input
                id="estimatedLength"
                type="number"
                value={estimatedLength}
                onChange={(e) => setEstimatedLength(e.target.value)}
                placeholder="np. 200"
                className="mt-1"
              />
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="requesterName">Imię i nazwisko</Label>
              <Input
                id="requesterName"
                name="name"
                value={requester.name}
                onChange={handleRequesterChange}
                placeholder="Jan Kowalski"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="requesterEmail">Adres e-mail</Label>
              <Input
                id="requesterEmail"
                name="email"
                type="email"
                value={requester.email}
                onChange={handleRequesterChange}
                placeholder="jan.kowalski@firma.pl"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="requesterDepartment">Dział</Label>
              <Input
                id="requesterDepartment"
                name="department"
                value={requester.department}
                onChange={handleRequesterChange}
                placeholder="Dział handlowy"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="specialRequirements">Wymagania specjalne</Label>
              <Textarea
                id="specialRequirements"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Np. potrzeba windy, samochód z windą"
                className="mt-1"
              />
            </div>
          </div>
        )}
        {step === 6 && getSummary()}
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
          className={`${step === 1 ? 'ml-auto' : ''} bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
          disabled={!isStepValid()}
        >
          {step < 6 ? 'Dalej' : 'Zatwierdź'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransportOrderForm;
