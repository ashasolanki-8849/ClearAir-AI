import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { IndoorDeviceData, IndoorRoomData } from '../../types';
import { indoorService } from '../../services/indoorService';
import { useToast } from '../../context/ToastContext';
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Plus,
  Play,
  Trash2,
  Activity,
  CheckCircle2,
  Info,
  Layers,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';

interface ConnectedDevicesPanelProps {
  devices: IndoorDeviceData[];
  rooms: IndoorRoomData[];
  onDeviceUpdated: () => void;
}

export const ConnectedDevicesPanel: React.FC<ConnectedDevicesPanelProps> = ({
  devices,
  rooms,
  onDeviceUpdated,
}) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?._id || '');
  const [deviceType, setDeviceType] = useState('physical_sensor');
  const [loading, setLoading] = useState(false);

  const handleActivateDemo = async () => {
    setLoading(true);
    try {
      const res = await indoorService.enableDemoDevice({
        roomId: rooms[0]?._id,
        roomName: rooms[0]?.roomName || 'Living Room',
      });
      if (res.success) {
        showToast('Demo simulated sensor activated for interface preview.', 'info');
        onDeviceUpdated();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to activate demo sensor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim() || !deviceIdentifier.trim()) {
      showToast('Please enter device name and identifier.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await indoorService.createDevice({
        deviceName: deviceName.trim(),
        deviceIdentifier: deviceIdentifier.trim(),
        deviceType,
        roomId: roomId || undefined,
      });

      if (res.success) {
        showToast('Device registered successfully.', 'success');
        setShowAddModal(false);
        setDeviceName('');
        setDeviceIdentifier('');
        onDeviceUpdated();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to register device', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Remove this device from your account?')) return;
    try {
      const res = await indoorService.deleteDevice(id);
      if (res.success) {
        showToast('Device removed.', 'info');
        onDeviceUpdated();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete device', 'error');
    }
  };

  const hasPhysicalDevices = devices.some((d) => !d.isDemo);

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
            <Cpu className="w-4 h-4" />
            Connected Indoor Air Quality Sensors
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            Hardware & IoT Sensor Integration Layer
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {!hasPhysicalDevices && devices.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActivateDemo}
              disabled={loading}
              className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Activate Demo Simulator</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Device</span>
          </Button>
        </div>
      </div>

      {/* Sensor Absence Scientific Notice (MANDATORY REQUIREMENT) */}
      {!hasPhysicalDevices && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Indoor air quality is not currently being measured
            </h4>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Standard laptops, desktop computers, and mobile phones <strong>do not possess internal laser particulate or chemical sensors</strong> and cannot measure indoor air quality. Actual indoor air data requires compatible physical monitors (e.g. optical laser PM2.5 sensors, NDIR CO2 sensors, or smart connected purifiers).
          </p>
          <p className="text-[11px] text-zinc-500">
            * While no physical hardware is linked, ClearAir AI provides empirical risk evaluations based on your Room Assessment responses and ambient CPCB meteorological telemetry.
          </p>
        </div>
      )}

      {/* Device List Grid */}
      {devices.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <Cpu className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No physical indoor monitors paired yet.
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
            You can register a hardware monitor via WiFi/Serial ID, or click "Activate Demo Simulator" to preview sensor telemetry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
            const readings = device.latestReadings;
            const isSimulated = device.isDemo || device.connectionStatus === 'simulated';

            return (
              <div
                key={device._id}
                className={`p-4 rounded-xl border transition-all ${
                  isSimulated
                    ? 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/5'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'
                }`}
              >
                <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {device.deviceName}
                      </span>
                      {isSimulated ? (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          SIMULATED DEMO
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          LIVE HARDWARE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 block mt-0.5">
                      {device.roomName} • ID: {device.deviceIdentifier}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteDevice(device._id)}
                    className="text-zinc-400 hover:text-red-500 p-1"
                    title="Remove device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Telemetry Readings Grid */}
                {readings ? (
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-center">
                      <span className="text-[10px] text-zinc-400 block">Indoor PM2.5</span>
                      <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {readings.pm25 != null ? `${readings.pm25} µg` : '--'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-center">
                      <span className="text-[10px] text-zinc-400 block">Carbon Dioxide</span>
                      <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {readings.co2 != null ? `${readings.co2} ppm` : '--'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-center">
                      <span className="text-[10px] text-zinc-400 block">Relative Humidity</span>
                      <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {readings.humidity != null ? `${readings.humidity}%` : '--'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-zinc-400">
                    Awaiting first reading transmission...
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    Status: {device.connectionStatus}
                  </span>
                  <span>
                    Updated {readings?.timestamp ? new Date(readings.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Device Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Indoor Air Monitor"
      >
        <form onSubmit={handleRegisterDevice} className="space-y-4 text-xs">
          <Input
            label="Device Friendly Name"
            placeholder="e.g. Living Room Air Monitor"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
          />

          <Input
            label="Device Identifier (MAC Address / Serial / Cloud ID)"
            placeholder="e.g. IAQ-SENSE-4F8A"
            value={deviceIdentifier}
            onChange={(e) => setDeviceIdentifier(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="font-semibold block text-zinc-800 dark:text-zinc-200">
              Associated Room
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
            >
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomName} ({r.roomType})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold block text-zinc-800 dark:text-zinc-200">
              Device Type
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="physical_sensor">Optical Laser PM2.5 / CO2 Sensor</option>
              <option value="smart_purifier">Smart Air Purifier with Telemetry</option>
              <option value="hvac_monitor">HVAC Duct Monitor</option>
              <option value="co_dedicated_sensor">Dedicated Carbon Monoxide Detector</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Pairing...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
