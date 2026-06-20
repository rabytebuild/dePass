import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

const _baseUrl = 'https://log.travelnetng.serv00.net/api';
const _secureStorage = FlutterSecureStorage();

class SessionProvider extends ChangeNotifier {
  String? _token;
  String? _userName;
  String? _role;
  List<Map<String, dynamic>> _events = [];
  List<Map<String, dynamic>> _passes = [];

  String? get token => _token;
  String? get userName => _userName;
  String? get role => _role;
  List<Map<String, dynamic>> get events => _events;
  List<Map<String, dynamic>> get passes => _passes;
  bool get isAuthenticated => _token != null;

  Map<String, String> get _authHeaders {
    return _token != null
        ? {
            'Authorization': 'Bearer $_token',
            'Accept': 'application/json',
          }
        : {
            'Accept': 'application/json',
          };
  }

  Future<void> initialize() async {
    final storedToken = await _secureStorage.read(key: 'api_token');
    final storedUser = await _secureStorage.read(key: 'user_name');
    final storedRole = await _secureStorage.read(key: 'user_role');

    if (storedToken != null) {
      _token = storedToken;
      _userName = storedUser;
      _role = storedRole;
      notifyListeners();
      await refreshData();
    }
  }

  Future<bool> login({required String username, required String password}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Accept': 'application/json'},
      body: {
        'username': username,
        'password': password,
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      _token = data['token'] as String?;
      _userName = data['user']?['username'] as String? ?? username;
      _role = data['user']?['role'] as String?;

      await _secureStorage.write(key: 'api_token', value: _token);
      await _secureStorage.write(key: 'user_name', value: _userName);
      await _secureStorage.write(key: 'user_role', value: _role);
      notifyListeners();
      await refreshData();
      return true;
    }

    return false;
  }

  Future<bool> refreshData() async {
    if (!isAuthenticated) {
      return false;
    }

    final eventsLoaded = await fetchEvents();
    final passesLoaded = eventsLoaded ? await fetchPasses() : false;
    return eventsLoaded && passesLoaded;
  }

  Future<bool> fetchEvents() async {
    if (!isAuthenticated) return false;

    final response = await http.get(
      Uri.parse('$_baseUrl/events'),
      headers: _authHeaders,
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final items = data['data'] as List<dynamic>?;
      _events = items
              ?.map((item) => Map<String, dynamic>.from(item as Map<String, dynamic>))
              .toList() ??
          [];
      notifyListeners();
      return true;
    }

    return false;
  }

  Future<bool> fetchPasses() async {
    if (!isAuthenticated || _events.isEmpty) {
      _passes = [];
      notifyListeners();
      return true;
    }

    final allPasses = <Map<String, dynamic>>[];

    for (final event in _events) {
      final eventId = event['id'];
      if (eventId == null) {
        continue;
      }

      final response = await http.get(
        Uri.parse('$_baseUrl/events/$eventId/passes'),
        headers: _authHeaders,
      );

      if (response.statusCode != 200) {
        continue;
      }

      final data = json.decode(response.body) as Map<String, dynamic>;
      final items = data['data'] as List<dynamic>?;
      if (items != null) {
        allPasses.addAll(items.map((item) => Map<String, dynamic>.from(item as Map<String, dynamic>)));
      }
    }

    _passes = allPasses;
    notifyListeners();
    return true;
  }

  void logout() {
    _token = null;
    _userName = null;
    _role = null;
    _events = [];
    _passes = [];
    _secureStorage.delete(key: 'api_token');
    _secureStorage.delete(key: 'user_name');
    _secureStorage.delete(key: 'user_role');
    notifyListeners();
  }
}
