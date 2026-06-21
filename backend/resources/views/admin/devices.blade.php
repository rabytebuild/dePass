@extends('layouts.admin')

@section('title', 'Devices')

@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Devices</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex gap-2 flex-wrap">
                <a href="{{ route('admin.devices', ['status' => 'all']) }}"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors {{ $filterStatus === 'all' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100' }}">
                    All
                </a>
                <a href="{{ route('admin.devices', ['status' => 'pending']) }}"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors {{ $filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-100' }}">
                    Pending
                </a>
                <a href="{{ route('admin.devices', ['status' => 'approved']) }}"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors {{ $filterStatus === 'approved' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100' }}">
                    Approved
                </a>
                <a href="{{ route('admin.devices', ['status' => 'revoked']) }}"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors {{ $filterStatus === 'revoked' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100' }}">
                    Revoked
                </a>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100 bg-gray-50">
                        <th class="text-left px-5 py-3 font-medium text-gray-500">UUID</th>
                        <th class="text-left px-5 py-3 font-medium text-gray-500">User</th>
                        <th class="text-left px-5 py-3 font-medium text-gray-500">Fingerprint</th>
                        <th class="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                        <th class="text-left px-5 py-3 font-medium text-gray-500">Approved By</th>
                        <th class="text-left px-5 py-3 font-medium text-gray-500">Created</th>
                        <th class="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($devices as $device)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-5 py-3 font-mono text-xs text-gray-700">{{ $device->uuid }}</td>
                            <td class="px-5 py-3">
                                <div class="flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center">
                                        {{ substr($device->user?->username ?? '?', 0, 1) }}
                                    </span>
                                    <span class="text-gray-900">{{ $device->user?->username ?? 'Unknown' }}</span>
                                </div>
                            </td>
                            <td class="px-5 py-3 font-mono text-xs text-gray-500">{{ Str::limit($device->device_fingerprint, 20) }}</td>
                            <td class="px-5 py-3">
                                <span class="text-xs px-2 py-0.5 rounded-full font-medium
                                    @if($device->status === 'approved') bg-green-50 text-green-700
                                    @elseif($device->status === 'pending') bg-yellow-50 text-yellow-700
                                    @elseif($device->status === 'revoked') bg-red-50 text-red-700
                                    @else bg-gray-100 text-gray-600
                                    @endif">
                                    {{ $device->status }}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-gray-600">{{ $device->approver?->username ?? '—' }}</td>
                            <td class="px-5 py-3 text-gray-400 text-xs">{{ $device->created_at?->format('M d, Y') }}</td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex items-center justify-end gap-1">
                                    @if($device->status === 'pending')
                                        <button class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors" title="Approve">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                            Approve
                                        </button>
                                        <button class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors" title="Revoke" onclick="if(confirm('Revoke this device?'))">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                                            Revoke
                                        </button>
                                    @elseif($device->status === 'approved')
                                        <button class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors" onclick="if(confirm('Revoke this device?'))">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                                            Revoke
                                        </button>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-5 py-12 text-center text-sm text-gray-400">No devices found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($devices->hasPages())
            <div class="px-5 py-3 border-t border-gray-100">
                {{ $devices->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
