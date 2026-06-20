<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemConfiguration;
use Illuminate\Http\Request;

class SystemConfigurationController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(SystemConfiguration::paginate(15));
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'key' => ['required', 'string', 'unique:system_configurations,key'],
            'value' => ['nullable', 'json'],
            'description' => ['nullable', 'string'],
        ]);

        $config = SystemConfiguration::create([
            'key' => $validated['key'],
            'value' => json_decode($validated['value'] ?? 'null', true),
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Configuration saved successfully',
            'configuration' => $config,
        ], 201);
    }

    public function show(SystemConfiguration $configuration, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($configuration);
    }

    public function update(Request $request, SystemConfiguration $configuration)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'value' => ['sometimes', 'json'],
            'description' => ['sometimes', 'string'],
        ]);

        $configuration->update([
            'value' => array_key_exists('value', $validated) ? json_decode($validated['value'], true) : $configuration->value,
            'description' => $validated['description'] ?? $configuration->description,
        ]);

        return response()->json([
            'message' => 'Configuration updated successfully',
            'configuration' => $configuration,
        ]);
    }

    public function destroy(SystemConfiguration $configuration, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $configuration->delete();

        return response()->json([
            'message' => 'Configuration removed successfully',
        ]);
    }
}
